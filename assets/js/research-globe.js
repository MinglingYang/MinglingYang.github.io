(function () {
  var canvas = document.getElementById("research-globe-canvas");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var globe = canvas.closest(".research-globe");
  var stage = canvas.closest(".research-globe__stage");
  var connectorLayer = globe && globe.querySelector(".research-globe__connectors");
  var leftColumn = document.getElementById("research-globe-left");
  var rightColumn = document.getElementById("research-globe-right");
  var rotationInput = document.getElementById("research-globe-rotation");
  var tiltInput = document.getElementById("research-globe-tilt");
  var zoomInput = document.getElementById("research-globe-zoom");
  var zoomIn = document.getElementById("research-globe-zoom-in");
  var zoomOut = document.getElementById("research-globe-zoom-out");
  var sortInput = document.getElementById("research-globe-sort");
  var yearInput = document.getElementById("research-globe-year");
  var yearLabel = document.getElementById("research-globe-year-label");
  var yearPanel = document.querySelector(".research-globe__time-panel");
  var yearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-globe-year]"));
  var moduleButtons = Array.prototype.slice.call(document.querySelectorAll("[data-globe-module]"));
  var cardNodes = Array.prototype.slice.call(document.querySelectorAll("#research-globe-left [data-location], #research-globe-right [data-location]"));
  var worldFeatures = [];

  var regionOrder = {
    "North America": 1,
    "Latin America": 2,
    "Africa": 3,
    "Asia": 4
  };

  var oceanLabels = [
    { name: "Pacific Ocean", lat: 5, lon: -160 },
    { name: "Atlantic Ocean", lat: 3, lon: -35 },
    { name: "Indian Ocean", lat: -20, lon: 78 },
    { name: "Arctic Ocean", lat: 74, lon: 10 }
  ];

  var sites = cardNodes.map(function (card, index) {
    return {
      id: card.getAttribute("data-location"),
      country: card.getAttribute("data-country") || "",
      region: card.getAttribute("data-region") || "",
      modules: String(card.getAttribute("data-modules") || "").split(/\s+/),
      count: Number(card.getAttribute("data-count") || 0),
      start: Number(card.getAttribute("data-start") || 1900),
      end: Number(card.getAttribute("data-end") || 2026),
      order: Number(card.getAttribute("data-order") || 99),
      name: card.querySelector("span") ? card.querySelector("span").textContent : "",
      lat: Number(card.getAttribute("data-lat")),
      lon: Number(card.getAttribute("data-lon")),
      card: card,
      index: index
    };
  });

  var countryCounts = sites.reduce(function (counts, site) {
    if (site.count > 0) counts[site.country] = Math.max(counts[site.country] || 0, site.count);
    return counts;
  }, {});

  var focusTargets = {
    education: { rotation: 98, tilt: 37, zoom: 1.38, activeId: "education-south-carolina" }
  };

  var state = {
    module: "all",
    sort: sortInput ? sortInput.value : "region",
    year: yearInput ? Number(yearInput.value) : 2026
  };
  var rotation = rotationInput ? Number(rotationInput.value) : -25;
  var tilt = tiltInput ? Number(tiltInput.value) : 8;
  var zoom = zoomInput ? Number(zoomInput.value) / 100 : 1;
  var activeId = "peru";
  var visibleSites = [];
  var markerPositions = {};
  var isDragging = false;
  var dragStart = null;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    var rect = stage.getBoundingClientRect();
    var width = Math.max(320, Math.floor(rect.width));
    var height = Math.max(430, Math.floor(rect.height));
    var ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    updateConnectorBox();
  }

  function updateConnectorBox() {
    if (!connectorLayer || !globe) return;
    var rect = globe.getBoundingClientRect();
    connectorLayer.setAttribute("viewBox", "0 0 " + rect.width + " " + rect.height);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizeRotation(value) {
    return ((value + 180) % 360 + 360) % 360 - 180;
  }

  function siteHasModule(site, moduleName) {
    return site.modules.indexOf(moduleName) !== -1;
  }

  function normalizeCountryName(name) {
    if (name === "United States of America") return "United States";
    return name || "";
  }

  function markerColor(count) {
    if (count >= 4) return "#ff6bd6";
    if (count >= 2) return "#32f0c8";
    if (count === 1) return "#4aa3ff";
    return "#ffd166";
  }

  function markerRadius(count, active) {
    var base = count >= 4 ? 8 : count >= 2 ? 7 : count === 1 ? 6 : 5.5;
    return active ? base + 2 : base;
  }

  function countryFill(count, active) {
    if (active && count > 0) return "rgba(255, 107, 214, .52)";
    if (count >= 4) return "rgba(106, 62, 170, .62)";
    if (count >= 2) return "rgba(8, 122, 142, .58)";
    if (count === 1) return "rgba(28, 84, 135, .54)";
    return "rgba(24, 83, 111, .2)";
  }

  function countryStroke(count, active) {
    if (active && count > 0) return "rgba(255, 226, 255, .88)";
    if (active) return "rgba(255, 209, 102, .72)";
    if (count > 0) return "rgba(72, 230, 255, .46)";
    return "rgba(72, 230, 255, .16)";
  }

  function syncInputs() {
    if (rotationInput) rotationInput.value = String(Math.round(normalizeRotation(rotation)));
    if (tiltInput) tiltInput.value = String(Math.round(tilt));
    if (zoomInput) zoomInput.value = String(Math.round(zoom * 100));
    if (yearInput) {
      yearInput.value = String(state.year);
      yearInput.setAttribute("aria-valuetext", "Through " + state.year);
    }
    if (yearLabel) yearLabel.textContent = String(state.year);
    yearButtons.forEach(function (button) {
      var buttonYear = Number(button.getAttribute("data-globe-year"));
      var distance = Math.abs(buttonYear - state.year);
      button.classList.toggle("is-active", distance === 0);
      button.classList.toggle("is-near", distance > 0 && distance <= 1);
      button.setAttribute("aria-selected", distance === 0 ? "true" : "false");
    });
  }

  function siteIsVisible(site) {
    var moduleMatch = state.module === "all" || site.modules.indexOf(state.module) !== -1;
    var yearMatch = site.start <= state.year;
    return moduleMatch && yearMatch;
  }

  function sortSites(items) {
    return items.slice().sort(function (a, b) {
      if (state.module === "education") {
        if (a.order !== b.order) return a.order - b.order;
      }
      if (state.sort === "count") {
        if (b.count !== a.count) return b.count - a.count;
      } else if (state.sort === "recent") {
        if (b.end !== a.end) return b.end - a.end;
      } else if (state.sort === "country") {
        return a.country.localeCompare(b.country) || a.name.localeCompare(b.name);
      } else {
        var regionDiff = (regionOrder[a.region] || 99) - (regionOrder[b.region] || 99);
        if (regionDiff) return regionDiff;
      }
      return a.name.localeCompare(b.name);
    });
  }

  function applyFilters() {
    visibleSites = sortSites(sites.filter(siteIsVisible));
    if (!visibleSites.some(function (site) { return site.id === activeId; }) && visibleSites.length) {
      activeId = visibleSites[0].id;
    }
    renderCards();
    updateCards();
    syncInputs();
  }

  function renderCards() {
    if (!leftColumn || !rightColumn) return;
    leftColumn.innerHTML = "";
    rightColumn.innerHTML = "";
    var displaySites = state.module === "education" ? visibleSites : visibleSites.filter(function (site) {
      return site.id === activeId;
    });
    if (!displaySites.length && visibleSites.length) displaySites = [visibleSites[0]];
    var midpoint = Math.ceil(displaySites.length / 2);
    displaySites.forEach(function (site, index) {
      site.card.classList.remove("is-hidden");
      if (index < midpoint) {
        leftColumn.appendChild(site.card);
      } else {
        rightColumn.appendChild(site.card);
      }
    });
    sites.forEach(function (site) {
      if (displaySites.indexOf(site) === -1) site.card.classList.add("is-hidden");
    });
  }

  function project(lat, lon, width, height, radius) {
    var centerLat = tilt * Math.PI / 180;
    var phi = lat * Math.PI / 180;
    var lambda = (lon + rotation) * Math.PI / 180;
    var sinPhi = Math.sin(phi);
    var cosPhi = Math.cos(phi);
    var cosLambda = Math.cos(lambda);
    var visible = Math.sin(centerLat) * sinPhi + Math.cos(centerLat) * cosPhi * cosLambda > -0.04;
    return {
      x: width / 2 + radius * cosPhi * Math.sin(lambda),
      y: height / 2 - radius * (Math.cos(centerLat) * sinPhi - Math.sin(centerLat) * cosPhi * cosLambda),
      visible: visible
    };
  }

  function drawSphere(width, height, radius) {
    var atmosphere = ctx.createRadialGradient(width / 2, height / 2, radius * .75, width / 2, height / 2, radius * 1.18);
    atmosphere.addColorStop(0, "rgba(32, 217, 255, 0)");
    atmosphere.addColorStop(.72, "rgba(32, 217, 255, .08)");
    atmosphere.addColorStop(1, "rgba(32, 217, 255, .28)");
    ctx.fillStyle = atmosphere;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius * 1.18, 0, Math.PI * 2);
    ctx.fill();

    var gradient = ctx.createRadialGradient(width * .38, height * .3, radius * .1, width / 2, height / 2, radius);
    gradient.addColorStop(0, "#194b73");
    gradient.addColorStop(.48, "#0d3358");
    gradient.addColorStop(1, "#04152d");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(72, 230, 255, .5)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  function drawLine(pointAt, start, end, width, height, radius) {
    var started = false;
    ctx.beginPath();
    for (var value = start; value <= end; value += 4) {
      var pair = pointAt(value);
      var p = project(pair[0], pair[1], width, height, radius);
      if (!p.visible) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
  }

  function drawGraticule(width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = "rgba(72, 230, 255, .22)";
    ctx.lineWidth = 1;
    for (var lat = -60; lat <= 60; lat += 20) {
      drawLine(function (lon) { return [lat, lon]; }, -180, 180, width, height, radius);
    }
    for (var lon = -150; lon <= 180; lon += 30) {
      drawLine(function (lat) { return [lat, lon]; }, -80, 80, width, height, radius);
    }
    ctx.restore();
  }

  function drawGeoRing(ring, width, height, radius, fillStyle, strokeStyle, lineWidth) {
    var started = false;
    var visibleCount = 0;
    ctx.beginPath();
    ring.forEach(function (pair) {
      var p = project(pair[1], pair[0], width, height, radius);
      if (!p.visible) {
        if (started && visibleCount > 2) {
          ctx.closePath();
          ctx.fillStyle = fillStyle;
          ctx.fill();
          ctx.strokeStyle = strokeStyle;
          ctx.lineWidth = lineWidth;
          ctx.stroke();
        }
        started = false;
        visibleCount = 0;
        ctx.beginPath();
        return;
      }
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
      visibleCount += 1;
    });
    if (started && visibleCount > 2) {
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function drawLand(width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    worldFeatures.forEach(function (feature) {
      if (!feature.geometry) return;
      var country = normalizeCountryName(feature.properties && (feature.properties.ADMIN || feature.properties.NAME || feature.properties.name));
      var count = countryCounts[country] || 0;
      var activeSite = sites.filter(function (site) { return site.id === activeId; })[0];
      var activeCountry = activeSite && activeSite.country === country;
      var fillStyle = countryFill(count, activeCountry);
      var strokeStyle = countryStroke(count, activeCountry);
      var lineWidth = activeCountry ? 1.4 : .65;
      var polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      polygons.forEach(function (polygon) {
        if (!polygon || !polygon[0]) return;
        drawGeoRing(polygon[0], width, height, radius, fillStyle, strokeStyle, lineWidth);
      });
    });
    ctx.restore();
  }

  function drawOceanLabels(width, height, radius) {
    ctx.save();
    ctx.font = "700 10px Arial, sans-serif";
    ctx.fillStyle = "rgba(143, 204, 230, .42)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    oceanLabels.forEach(function (item) {
      var p = project(item.lat, item.lon, width, height, radius);
      if (!p.visible) return;
      ctx.fillText(item.name, p.x, p.y);
    });
    ctx.restore();
  }

  function drawOrbits(width, height, radius) {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.strokeStyle = "rgba(72, 230, 255, .18)";
    ctx.lineWidth = 1;
    [-18, 18, 42].forEach(function (angle) {
      ctx.save();
      ctx.rotate(angle * Math.PI / 180);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.12, radius * .34, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }

  function drawArrowHead(from, to, color) {
    var angle = Math.atan2(to.y - from.y, to.x - from.x);
    var size = 9;
    ctx.save();
    ctx.translate(to.x, to.y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size * .48);
    ctx.lineTo(-size, size * .48);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawEducationPath(width, height, radius) {
    if (state.module !== "education") return;
    var educationSites = visibleSites.filter(function (site) {
      return siteHasModule(site, "education");
    }).sort(function (a, b) {
      return a.order - b.order;
    });
    if (educationSites.length < 2) return;
    var points = educationSites.map(function (site) {
      var p = project(site.lat, site.lon, width, height, radius);
      p.site = site;
      return p;
    }).filter(function (p) {
      return p.visible;
    });
    if (points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 209, 102, .92)";
    ctx.fillStyle = "rgba(255, 209, 102, .92)";
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "rgba(255, 209, 102, .65)";
    ctx.shadowBlur = 12;
    for (var i = 0; i < points.length - 1; i += 1) {
      var start = points[i];
      var end = points[i + 1];
      var midX = (start.x + end.x) / 2;
      var midY = (start.y + end.y) / 2 - 28;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(midX, midY, end.x, end.y);
      ctx.stroke();
      drawArrowHead({ x: midX, y: midY }, end, "rgba(255, 209, 102, .96)");
    }
    ctx.shadowBlur = 0;
    ctx.font = "700 10px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    points.forEach(function (point) {
      ctx.fillText(String(point.site.start), point.x, point.y - 14);
    });
    ctx.restore();
  }

  function drawSites(width, height, radius, time) {
    markerPositions = {};
    visibleSites.forEach(function (site) {
      var p = project(site.lat, site.lon, width, height, radius);
      if (!p.visible) return;
      markerPositions[site.id] = { x: p.x, y: p.y };
      var active = site.id === activeId;
      var pulse = active ? 7 + Math.sin(time / 220) * 2 : 3 + Math.sin(time / 520 + site.index) * 1.2;
      var dotRadius = markerRadius(site.count, active);
      ctx.fillStyle = "rgba(72, 230, 255, .13)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14 + pulse + site.count * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = markerColor(site.count);
      ctx.strokeStyle = active ? "#ffffff" : "rgba(226, 251, 255, .86)";
      ctx.lineWidth = active ? 3 : 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (site.count > 0) {
        ctx.fillStyle = site.count >= 4 ? "#061728" : "#ffffff";
        ctx.font = "700 10px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(site.count), p.x, p.y + .5);
      } else if (siteHasModule(site, "education")) {
        ctx.fillStyle = "#061728";
        ctx.font = "700 8px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(site.order), p.x, p.y + .5);
      }
    });
  }

  function updateCards() {
    sites.forEach(function (site) {
      site.card.classList.toggle("is-active", site.id === activeId);
    });
  }

  function updateConnectors() {
    if (!connectorLayer || !globe) return;
    var globeRect = globe.getBoundingClientRect();
    var canvasRect = canvas.getBoundingClientRect();
    var paths = [];
    visibleSites.forEach(function (site) {
      if (site.card.classList.contains("is-hidden")) return;
      var marker = markerPositions[site.id];
      if (!marker) return;
      var cardRect = site.card.getBoundingClientRect();
      var startX = canvasRect.left - globeRect.left + marker.x;
      var startY = canvasRect.top - globeRect.top + marker.y;
      var cardOnLeft = cardRect.left < canvasRect.left;
      var endX = (cardOnLeft ? cardRect.right : cardRect.left) - globeRect.left;
      var endY = cardRect.top - globeRect.top + Math.min(34, cardRect.height / 2);
      var bendX = cardOnLeft ? startX - 46 : startX + 46;
      var color = site.id === activeId ? "#48e6ff" : "rgba(72, 230, 255, .22)";
      var width = site.id === activeId ? 2.3 : 1.1;
      paths.push("<path d=\"M" + startX.toFixed(1) + " " + startY.toFixed(1) + " C " + bendX.toFixed(1) + " " + startY.toFixed(1) + ", " + bendX.toFixed(1) + " " + endY.toFixed(1) + ", " + endX.toFixed(1) + " " + endY.toFixed(1) + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"" + width + "\" stroke-linecap=\"round\"/>");
      if (site.id === activeId) {
        paths.push("<circle cx=\"" + endX.toFixed(1) + "\" cy=\"" + endY.toFixed(1) + "\" r=\"3.2\" fill=\"#48e6ff\"/>");
      }
    });
    connectorLayer.innerHTML = paths.join("");
  }

  function setActive(id) {
    activeId = id;
    var site = sites.filter(function (item) { return item.id === id; })[0];
    if (site) {
      var desired = normalizeRotation(-site.lon);
      var delta = normalizeRotation(desired - rotation);
      if (Math.abs(delta) > 78) rotation += delta * .35;
      renderCards();
      updateCards();
      syncInputs();
    }
  }

  function focusModule(moduleName) {
    var target = focusTargets[moduleName];
    if (!target) return;
    rotation = target.rotation;
    tilt = target.tilt;
    zoom = target.zoom;
    activeId = target.activeId;
  }

  function nearestMarker(x, y) {
    var best = null;
    Object.keys(markerPositions).forEach(function (id) {
      var marker = markerPositions[id];
      var dx = marker.x - x;
      var dy = marker.y - y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 26 && (!best || dist < best.dist)) best = { id: id, dist: dist };
    });
    return best && best.id;
  }

  function render(time) {
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    var radius = Math.min(width, height) * .35 * zoom;
    ctx.clearRect(0, 0, width, height);
    if (!reduceMotion && !isDragging) rotation += .018;
    drawOrbits(width, height, radius);
    drawSphere(width, height, radius);
    drawLand(width, height, radius);
    drawGraticule(width, height, radius);
    drawOceanLabels(width, height, radius);
    drawEducationPath(width, height, radius);
    drawSites(width, height, radius, time || 0);
    updateConnectors();
    window.requestAnimationFrame(render);
  }

  sites.forEach(function (site) {
    site.card.setAttribute("tabindex", "0");
    site.card.addEventListener("click", function () {
      setActive(site.id);
    });
    site.card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(site.id);
      }
    });
  });

  moduleButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      state.module = button.getAttribute("data-globe-module");
      focusModule(state.module);
      moduleButtons.forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      applyFilters();
    });
  });

  if (sortInput) {
    sortInput.addEventListener("change", function () {
      state.sort = sortInput.value;
      applyFilters();
    });
  }

  if (yearInput) {
    yearInput.addEventListener("input", function () {
      state.year = Number(yearInput.value);
      applyFilters();
    });
  }

  function setYear(value) {
    if (!yearInput) return;
    var nextYear = clamp(Number(value), Number(yearInput.getAttribute("min")), Number(yearInput.getAttribute("max")));
    if (nextYear === state.year) {
      syncInputs();
      return;
    }
    state.year = nextYear;
    applyFilters();
  }

  yearButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setYear(button.getAttribute("data-globe-year"));
    });
  });

  if (yearPanel && yearInput) {
    yearPanel.addEventListener("wheel", function (event) {
      event.preventDefault();
      var step = event.deltaY > 0 ? -1 : 1;
      setYear(state.year + step);
    }, { passive: false });

    yearPanel.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        setYear(state.year + 1);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        setYear(state.year - 1);
      }
    });
  }

  if (zoomInput) {
    zoomInput.addEventListener("input", function () {
      zoom = Number(zoomInput.value) / 100;
      syncInputs();
    });
  }

  function changeZoom(delta) {
    zoom = clamp(zoom + delta, .82, 1.45);
    syncInputs();
  }

  if (zoomIn) zoomIn.addEventListener("click", function () { changeZoom(.08); });
  if (zoomOut) zoomOut.addEventListener("click", function () { changeZoom(-.08); });

  canvas.addEventListener("pointerdown", function (event) {
    isDragging = true;
    dragStart = { x: event.clientX, y: event.clientY, rotation: rotation, tilt: tilt };
    canvas.classList.add("is-dragging");
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", function (event) {
    if (!isDragging || !dragStart) return;
    rotation = dragStart.rotation + (event.clientX - dragStart.x) * .32;
    tilt = clamp(dragStart.tilt + (event.clientY - dragStart.y) * .18, -35, 35);
    syncInputs();
  });

  canvas.addEventListener("pointerup", function (event) {
    if (!isDragging) return;
    isDragging = false;
    canvas.classList.remove("is-dragging");
    canvas.releasePointerCapture(event.pointerId);
    var rect = canvas.getBoundingClientRect();
    var id = nearestMarker(event.clientX - rect.left, event.clientY - rect.top);
    if (id) setActive(id);
  });

  canvas.addEventListener("pointercancel", function () {
    isDragging = false;
    canvas.classList.remove("is-dragging");
  });

  if (rotationInput) {
    rotationInput.addEventListener("input", function () {
      rotation = Number(rotationInput.value);
    });
  }

  if (tiltInput) {
    tiltInput.addEventListener("input", function () {
      tilt = Number(tiltInput.value);
    });
  }

  window.addEventListener("resize", function () {
    resize();
    updateConnectors();
  });

  function loadWorld() {
    if (!window.fetch) return;
    window.fetch("/assets/data/world-countries.geojson")
      .then(function (response) {
        if (!response.ok) throw new Error("World map data unavailable");
        return response.json();
      })
      .then(function (data) {
        worldFeatures = data.features || [];
      })
      .catch(function () {
        worldFeatures = [];
      });
  }

  resize();
  loadWorld();
  applyFilters();
  window.requestAnimationFrame(render);
})();
