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
  var moduleButtons = Array.prototype.slice.call(document.querySelectorAll("[data-globe-module]"));
  var cardNodes = Array.prototype.slice.call(document.querySelectorAll("#research-globe-left [data-location], #research-globe-right [data-location]"));

  var regionOrder = {
    "North America": 1,
    "Latin America": 2,
    "Africa": 3,
    "Asia": 4
  };

  var sites = cardNodes.map(function (card, index) {
    return {
      id: card.getAttribute("data-location"),
      country: card.getAttribute("data-country") || "",
      region: card.getAttribute("data-region") || "",
      modules: String(card.getAttribute("data-modules") || "").split(/\s+/),
      count: Number(card.getAttribute("data-count") || 0),
      start: Number(card.getAttribute("data-start") || 1900),
      end: Number(card.getAttribute("data-end") || 2026),
      name: card.querySelector("span") ? card.querySelector("span").textContent : "",
      lat: Number(card.getAttribute("data-lat")),
      lon: Number(card.getAttribute("data-lon")),
      card: card,
      index: index
    };
  });

  var land = [
    [[-168, 72], [-135, 70], [-112, 54], [-95, 47], [-82, 32], [-96, 18], [-118, 22], [-137, 45]],
    [[-82, 13], [-66, 8], [-54, -8], [-58, -24], [-70, -55], [-78, -38], [-76, -12]],
    [[-10, 36], [8, 58], [42, 63], [78, 55], [112, 58], [145, 49], [124, 24], [77, 7], [38, 16], [20, 35]],
    [[-18, 33], [14, 34], [34, 16], [41, -3], [31, -30], [18, -35], [4, -20], [-8, 5]],
    [[68, 24], [90, 25], [96, 12], [79, 6], [72, 15]],
    [[112, -10], [154, -24], [144, -42], [116, -35]],
    [[-52, 76], [-22, 72], [-36, 60], [-58, 62]]
  ];

  var state = {
    module: "all",
    sort: sortInput ? sortInput.value : "region",
    year: yearInput ? Number(yearInput.value) : 2026
  };
  var rotation = rotationInput ? Number(rotationInput.value) : -25;
  var tilt = tiltInput ? Number(tiltInput.value) : 8;
  var zoom = zoomInput ? Number(zoomInput.value) / 100 : 1;
  var activeId = "puno-peru";
  var visibleSites = [];
  var markerPositions = {};
  var isDragging = false;
  var dragStart = null;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    var rect = stage.getBoundingClientRect();
    var width = Math.max(320, Math.floor(rect.width));
    var height = Math.max(356, Math.floor(rect.height - 82));
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

  function markerColor(count) {
    if (count >= 4) return "#dffcff";
    if (count >= 2) return "#48e6ff";
    if (count === 1) return "#18b8e6";
    return "#2f7ea8";
  }

  function markerRadius(count, active) {
    var base = count >= 4 ? 8 : count >= 2 ? 7 : count === 1 ? 6 : 5;
    return active ? base + 2 : base;
  }

  function syncInputs() {
    if (rotationInput) rotationInput.value = String(Math.round(normalizeRotation(rotation)));
    if (tiltInput) tiltInput.value = String(Math.round(tilt));
    if (zoomInput) zoomInput.value = String(Math.round(zoom * 100));
    if (yearLabel) yearLabel.textContent = "Through " + state.year;
  }

  function siteIsVisible(site) {
    var moduleMatch = state.module === "all" || site.modules.indexOf(state.module) !== -1;
    var yearMatch = site.start <= state.year;
    return moduleMatch && yearMatch;
  }

  function sortSites(items) {
    return items.slice().sort(function (a, b) {
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
    var midpoint = Math.ceil(visibleSites.length / 2);
    visibleSites.forEach(function (site, index) {
      site.card.classList.remove("is-hidden");
      if (index < midpoint) {
        leftColumn.appendChild(site.card);
      } else {
        rightColumn.appendChild(site.card);
      }
    });
    sites.forEach(function (site) {
      if (visibleSites.indexOf(site) === -1) site.card.classList.add("is-hidden");
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

  function drawLand(width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(27, 104, 132, .32)";
    ctx.strokeStyle = "rgba(72, 230, 255, .22)";
    ctx.lineWidth = 1;
    land.forEach(function (poly) {
      var started = false;
      ctx.beginPath();
      poly.forEach(function (pair) {
        var p = project(pair[1], pair[0], width, height, radius);
        if (!p.visible) return;
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });
      if (started) {
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
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
      updateCards();
      syncInputs();
    }
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

  resize();
  applyFilters();
  window.requestAnimationFrame(render);
})();
