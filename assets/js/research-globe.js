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
  var yearInput = document.getElementById("research-globe-year");
  var yearLabel = document.getElementById("research-globe-year-label");
  var yearPanel = document.querySelector(".research-globe__time-panel");
  var yearWheel = document.querySelector(".research-globe__year-wheel");
  var yearButtons = [];
  var moduleButtons = Array.prototype.slice.call(document.querySelectorAll("[data-globe-module]"));
  var cardNodes = Array.prototype.slice.call(document.querySelectorAll("#research-globe-left [data-location], #research-globe-right [data-location]"));
  var worldFeatures = [];
  var minYear = yearInput ? Number(yearInput.getAttribute("min") || 2017) : 2017;
  var maxYear = Math.max(new Date().getFullYear(), minYear);

  var regionOrder = {
    "North America": 1,
    "Latin America": 2,
    "Europe": 3,
    "Africa": 4,
    "Asia": 5
  };

  var oceanLabels = [
    { name: "Pacific Ocean", lat: 5, lon: -160 },
    { name: "Atlantic Ocean", lat: 3, lon: -35 },
    { name: "Indian Ocean", lat: -20, lon: 78 },
    { name: "Arctic Ocean", lat: 74, lon: 10 }
  ];

  var cityLights = [
    { name: "Los Angeles", lat: 34.05, lon: -118.24, glow: 1.1 },
    { name: "San Francisco", lat: 37.77, lon: -122.42, glow: 1 },
    { name: "Phoenix", lat: 33.45, lon: -112.07, glow: .85 },
    { name: "Baltimore", lat: 39.29, lon: -76.61, glow: .82 },
    { name: "New York", lat: 40.71, lon: -74.01, glow: 1.15 },
    { name: "Amsterdam", lat: 52.37, lon: 4.9, glow: .9 },
    { name: "Lima", lat: -12.05, lon: -77.04, glow: .9 },
    { name: "Puno", lat: -15.84, lon: -70.02, glow: .74 },
    { name: "Kathmandu", lat: 27.72, lon: 85.32, glow: .82 },
    { name: "Kampala", lat: .35, lon: 32.58, glow: .78 },
    { name: "Guatemala City", lat: 14.63, lon: -90.51, glow: .78 },
    { name: "Kigali", lat: -1.94, lon: 30.06, glow: .68 },
    { name: "Delhi", lat: 28.61, lon: 77.21, glow: 1.05 }
  ];

  function parseCities(value) {
    return String(value || "").split(";").map(function (entry) {
      var parts = entry.split("|");
      return {
        name: parts[0] || "",
        lat: Number(parts[1]),
        lon: Number(parts[2])
      };
    }).filter(function (city) {
      return city.name && !Number.isNaN(city.lat) && !Number.isNaN(city.lon);
    });
  }

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
      cities: parseCities(card.getAttribute("data-cities")),
      card: card,
      index: index
    };
  });

  var countryCounts = sites.reduce(function (counts, site) {
    if (site.count > 0) counts[site.country] = Math.max(counts[site.country] || 0, site.count);
    return counts;
  }, {});

  var focusTargets = {
    education: { rotation: 98, tilt: 37, zoom: 1.34, activeId: "education-south-carolina" },
    presentation: { rotation: 66, tilt: 36, zoom: 1.12, activeId: "presentation-ats-2025" }
  };

  var state = {
    module: "all",
    year: maxYear
  };
  var rotation = rotationInput ? Number(rotationInput.value) : -25;
  var tilt = tiltInput ? Number(tiltInput.value) : 8;
  var zoom = zoomInput ? Number(zoomInput.value) / 100 : 1;
  var activeId = "peru";
  var visibleSites = [];
  var markerPositions = {};
  var isDragging = false;
  var dragStart = null;
  var autoSpin = true;
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

  function buildYearWheel() {
    if (!yearWheel) return;
    yearWheel.innerHTML = "";
    yearButtons = [];
    for (var year = maxYear; year >= minYear; year -= 1) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "option");
      button.setAttribute("data-globe-year", String(year));
      button.textContent = String(year);
      yearWheel.appendChild(button);
      yearButtons.push(button);
    }
    if (yearInput) {
      yearInput.setAttribute("max", String(maxYear));
      yearInput.value = String(maxYear);
    }
  }

  function siteHasModule(site, moduleName) {
    return site.modules.indexOf(moduleName) !== -1;
  }

  function normalizeCountryName(name) {
    if (name === "United States of America") return "United States";
    return name || "";
  }

  function markerColor(site) {
    var count = site.count;
    if (siteHasModule(site, "presentation")) return "#00d5ff";
    if (count >= 4) return "#ffd166";
    if (count >= 2) return "#42f59b";
    if (count === 1) return "#00d5ff";
    return "#8ca3b0";
  }

  function markerRadius(count, active) {
    var base = count >= 4 ? 8 : count >= 2 ? 7 : count === 1 ? 6 : 5.5;
    return active ? base + 2 : base;
  }

  function countryFill(count, active) {
    if (active && (count > 0 || state.module === "presentation")) return "rgba(0, 213, 255, .54)";
    if (count >= 4) return "rgba(255, 209, 102, .46)";
    if (count >= 2) return "rgba(66, 245, 155, .38)";
    if (count === 1) return "rgba(0, 213, 255, .34)";
    return "rgba(18, 62, 74, .46)";
  }

  function countryStroke(count, active) {
    if (active && count > 0) return "rgba(234, 255, 255, .96)";
    if (active) return "rgba(0, 213, 255, .86)";
    if (count > 0) return "rgba(0, 213, 255, .72)";
    return "rgba(49, 182, 218, .28)";
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
    if (globe) {
      globe.classList.toggle("is-education-mode", state.module === "education");
      globe.classList.toggle("is-project-mode", state.module === "project");
      globe.classList.toggle("is-publication-mode", state.module === "publication");
      globe.classList.toggle("is-presentation-mode", state.module === "presentation");
    }
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
      if (state.module === "presentation") {
        if (a.order !== b.order) return a.order - b.order;
      }
      if (state.module === "publication") {
        if (b.count !== a.count) return b.count - a.count;
      }
      var regionDiff = (regionOrder[a.region] || 99) - (regionOrder[b.region] || 99);
      if (regionDiff) return regionDiff;
      if (b.end !== a.end) return b.end - a.end;
      return a.name.localeCompare(b.name);
    });
  }

  function applyFilters(options) {
    options = options || {};
    visibleSites = sortSites(sites.filter(siteIsVisible));
    if (!visibleSites.some(function (site) { return site.id === activeId; }) && visibleSites.length) {
      activeId = visibleSites[0].id;
    }
    renderCards();
    updateCards();
    syncInputs();
    if (options.focusActive) focusActiveSite(options.zoom);
  }

  function renderCards() {
    if (!leftColumn || !rightColumn) return;
    leftColumn.innerHTML = "";
    rightColumn.innerHTML = "";
    var showAllCards = state.module === "education" || state.module === "presentation";
    var displaySites = showAllCards ? visibleSites : visibleSites.filter(function (site) {
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
    resize();
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

  function fract(value) {
    return value - Math.floor(value);
  }

  function terrainNoise(lat, lon) {
    var fine = fract(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453);
    var broad = fract(Math.sin(lat * 3.71 - lon * 9.43) * 12972.349);
    return fine * .58 + broad * .42;
  }

  function drawSphere(width, height, radius) {
    var atmosphere = ctx.createRadialGradient(width / 2, height / 2, radius * .75, width / 2, height / 2, radius * 1.18);
    atmosphere.addColorStop(0, "rgba(0, 213, 255, 0)");
    atmosphere.addColorStop(.72, "rgba(0, 213, 255, .14)");
    atmosphere.addColorStop(1, "rgba(0, 213, 255, .48)");
    ctx.fillStyle = atmosphere;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius * 1.18, 0, Math.PI * 2);
    ctx.fill();

    var gradient = ctx.createRadialGradient(width * .36, height * .28, radius * .08, width / 2, height / 2, radius);
    gradient.addColorStop(0, "#1c6f8d");
    gradient.addColorStop(.34, "#0c385f");
    gradient.addColorStop(.72, "#061d3d");
    gradient.addColorStop(1, "#020816");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    var shade = ctx.createRadialGradient(width * .38, height * .3, radius * .15, width * .6, height * .58, radius * 1.08);
    shade.addColorStop(0, "rgba(255, 255, 255, .22)");
    shade.addColorStop(.48, "rgba(0, 0, 0, 0)");
    shade.addColorStop(1, "rgba(0, 0, 0, .38)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(0, 213, 255, .72)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  function drawSurfaceTexture(width, height, radius, time) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalCompositeOperation = "screen";
    for (var lat = -72; lat <= 72; lat += 5) {
      for (var lon = -180; lon <= 180; lon += 6) {
        var p = project(lat, lon + (time || 0) * .0008, width, height, radius);
        if (!p.visible) continue;
        var noise = terrainNoise(lat, lon);
        var polar = Math.abs(lat) > 56;
        var alpha = polar ? .14 : .06 + noise * .16;
        ctx.fillStyle = polar
          ? "rgba(210, 250, 255, " + alpha.toFixed(3) + ")"
          : noise > .68
            ? "rgba(125, 255, 198, " + alpha.toFixed(3) + ")"
            : "rgba(0, 213, 255, " + alpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, noise > .72 ? 1.35 : .82, 0, Math.PI * 2);
        ctx.fill();
        if (noise > .76) {
          var p2 = project(lat + 1.8, lon + 2.6, width, height, radius);
          if (p2.visible) {
            ctx.strokeStyle = "rgba(230, 255, 255, .16)";
            ctx.lineWidth = .7;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }

  function drawNightLights(width, height, radius, time) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalCompositeOperation = "screen";
    cityLights.forEach(function (city, index) {
      var p = project(city.lat, city.lon, width, height, radius);
      if (!p.visible) return;
      var pulse = .75 + Math.sin((time || 0) / 420 + index) * .18;
      var glow = city.glow * pulse;
      var gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10 * glow);
      gradient.addColorStop(0, "rgba(255, 229, 153, .9)");
      gradient.addColorStop(.3, "rgba(255, 209, 102, .42)");
      gradient.addColorStop(1, "rgba(255, 209, 102, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10 * glow, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 246, 210, .9)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.15 * glow, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }

  function drawHologramScan(width, height, radius, time) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalCompositeOperation = "screen";
    var offset = ((time || 0) / 38) % 14;
    for (var y = height / 2 - radius; y <= height / 2 + radius; y += 14) {
      ctx.strokeStyle = "rgba(0, 213, 255, .07)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2 - radius, y + offset);
      ctx.lineTo(width / 2 + radius, y + offset);
      ctx.stroke();
    }
    var sweepY = height / 2 - radius + ((time || 0) / 20) % (radius * 2);
    var sweep = ctx.createLinearGradient(width / 2 - radius, sweepY, width / 2 + radius, sweepY);
    sweep.addColorStop(0, "rgba(0, 213, 255, 0)");
    sweep.addColorStop(.5, "rgba(0, 213, 255, .22)");
    sweep.addColorStop(1, "rgba(0, 213, 255, 0)");
    ctx.strokeStyle = sweep;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - radius, sweepY);
    ctx.lineTo(width / 2 + radius, sweepY);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }

  function drawHudOverlay(width, height, radius, time) {
    var cx = width / 2;
    var cy = height / 2;
    ctx.save();
    ctx.strokeStyle = "rgba(0, 213, 255, .2)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.07, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(66, 245, 155, .24)";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * .74, ((time || 0) / 1600) % (Math.PI * 2), Math.PI * 1.12 + ((time || 0) / 1600) % (Math.PI * 2));
    ctx.stroke();
    ctx.strokeStyle = "rgba(0, 213, 255, .16)";
    ctx.beginPath();
    ctx.moveTo(cx - radius * 1.18, cy);
    ctx.lineTo(cx - radius * .92, cy);
    ctx.moveTo(cx + radius * .92, cy);
    ctx.lineTo(cx + radius * 1.18, cy);
    ctx.moveTo(cx, cy - radius * 1.18);
    ctx.lineTo(cx, cy - radius * .92);
    ctx.moveTo(cx, cy + radius * .92);
    ctx.lineTo(cx, cy + radius * 1.18);
    ctx.stroke();
    ctx.restore();
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
    ctx.strokeStyle = "rgba(0, 213, 255, .22)";
    ctx.lineWidth = .9;
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
      var lineWidth = activeCountry ? 1.55 : .72;
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
    ctx.fillStyle = "rgba(126, 224, 255, .42)";
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
    ctx.strokeStyle = "rgba(0, 213, 255, .24)";
    ctx.lineWidth = .9;
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
    ctx.strokeStyle = "rgba(0, 213, 255, .86)";
    ctx.fillStyle = "rgba(0, 213, 255, .9)";
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "rgba(0, 213, 255, .72)";
    ctx.shadowBlur = 14;
    for (var i = 0; i < points.length - 1; i += 1) {
      var start = points[i];
      var end = points[i + 1];
      var midX = (start.x + end.x) / 2;
      var midY = (start.y + end.y) / 2 - 28;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(midX, midY, end.x, end.y);
      ctx.stroke();
      drawArrowHead({ x: midX, y: midY }, end, "rgba(0, 213, 255, .96)");
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

  function drawPresentationPath(width, height, radius) {
    if (state.module !== "presentation") return;
    var presentationSites = visibleSites.filter(function (site) {
      return siteHasModule(site, "presentation");
    }).sort(function (a, b) {
      return a.order - b.order;
    });
    if (presentationSites.length < 2) return;
    var points = presentationSites.map(function (site) {
      var p = project(site.lat, site.lon, width, height, radius);
      p.site = site;
      return p;
    }).filter(function (p) {
      return p.visible;
    });
    if (points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = "rgba(0, 213, 255, .82)";
    ctx.fillStyle = "rgba(0, 213, 255, .9)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(0, 213, 255, .74)";
    ctx.shadowBlur = 14;
    for (var i = 0; i < points.length - 1; i += 1) {
      var start = points[i];
      var end = points[i + 1];
      var midX = (start.x + end.x) / 2;
      var midY = (start.y + end.y) / 2 - 20;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(midX, midY, end.x, end.y);
      ctx.stroke();
      drawArrowHead({ x: midX, y: midY }, end, "rgba(0, 213, 255, .92)");
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
      ctx.fillStyle = "rgba(0, 213, 255, .16)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14 + pulse + site.count * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = markerColor(site);
      ctx.strokeStyle = active ? "#eaffff" : "rgba(234, 255, 255, .86)";
      ctx.lineWidth = active ? 2.4 : 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (site.count > 0) {
        ctx.fillStyle = "#03121f";
        ctx.font = "700 10px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(site.count), p.x, p.y + .5);
      } else if (siteHasModule(site, "education") || siteHasModule(site, "presentation")) {
        ctx.fillStyle = "#03121f";
        ctx.font = "700 8px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(site.order), p.x, p.y + .5);
      }
    });
  }

  function drawArticleCities(width, height, radius, time) {
    if (state.module !== "publication") return;
    var site = visibleSites.filter(function (item) { return item.id === activeId; })[0];
    if (!site || !site.cities.length) return;
    var origin = markerPositions[site.id];
    ctx.save();
    site.cities.forEach(function (city, index) {
      var p = project(city.lat, city.lon, width, height, radius);
      if (!p.visible) return;
      var pulse = 3 + Math.sin((time || 0) / 240 + index) * 1.4;
      if (origin) {
        ctx.strokeStyle = "rgba(0, 213, 255, .52)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(0, 213, 255, .26)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#42f59b";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.font = "800 10px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "#dfffff";
      ctx.shadowColor = "rgba(0, 16, 32, .9)";
      ctx.shadowBlur = 6;
      ctx.fillText(city.name, p.x, p.y - 11);
    });
    ctx.restore();
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
      var color = site.id === activeId ? "#00d5ff" : "rgba(0, 213, 255, .26)";
      var width = site.id === activeId ? 2.3 : 1.1;
      paths.push("<path d=\"M" + startX.toFixed(1) + " " + startY.toFixed(1) + " C " + bendX.toFixed(1) + " " + startY.toFixed(1) + ", " + bendX.toFixed(1) + " " + endY.toFixed(1) + ", " + endX.toFixed(1) + " " + endY.toFixed(1) + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"" + width + "\" stroke-linecap=\"round\"/>");
      if (site.id === activeId) {
        paths.push("<circle cx=\"" + endX.toFixed(1) + "\" cy=\"" + endY.toFixed(1) + "\" r=\"3.2\" fill=\"#00d5ff\"/>");
      }
    });
    connectorLayer.innerHTML = paths.join("");
  }

  function setActive(id) {
    activeId = id;
    var site = sites.filter(function (item) { return item.id === id; })[0];
    if (site) {
      focusSite(site);
      renderCards();
      updateCards();
      syncInputs();
    }
  }

  function focusZoomForSite(site) {
    if (state.module === "publication") return site.count >= 3 ? 1.4 : 1.34;
    if (state.module === "presentation") return 1.28;
    if (state.module === "education") return 1.34;
    return site.count >= 3 ? 1.32 : 1.26;
  }

  function focusSite(site, targetZoom) {
    if (!site) return;
    autoSpin = false;
    rotation = normalizeRotation(-site.lon);
    tilt = clamp(site.lat, -46, 56);
    zoom = clamp(targetZoom || focusZoomForSite(site), .82, 1.72);
    syncInputs();
  }

  function focusActiveSite(targetZoom) {
    var site = visibleSites.filter(function (item) { return item.id === activeId; })[0];
    if (site) focusSite(site, targetZoom);
  }

  function focusModule(moduleName) {
    var target = focusTargets[moduleName];
    if (!target) return;
    autoSpin = false;
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
      if (dist < 34 && (!best || dist < best.dist)) best = { id: id, dist: dist };
    });
    return best && best.id;
  }

  function render(time) {
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    var radius = Math.min(width, height) * .36 * zoom;
    ctx.clearRect(0, 0, width, height);
    if (!reduceMotion && !isDragging && autoSpin) rotation += .018;
    drawOrbits(width, height, radius);
    drawSphere(width, height, radius);
    drawLand(width, height, radius);
    drawSurfaceTexture(width, height, radius, time || 0);
    drawGraticule(width, height, radius);
    drawOceanLabels(width, height, radius);
    drawNightLights(width, height, radius, time || 0);
    drawEducationPath(width, height, radius);
    drawPresentationPath(width, height, radius);
    drawSites(width, height, radius, time || 0);
    drawArticleCities(width, height, radius, time || 0);
    drawHologramScan(width, height, radius, time || 0);
    drawHudOverlay(width, height, radius, time || 0);
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
      applyFilters({
        focusActive: state.module !== "all" && state.module !== "education" && state.module !== "presentation",
        zoom: state.module === "publication" ? 1.4 : 1.3
      });
    });
  });

  if (yearInput) {
    yearInput.addEventListener("input", function () {
      autoSpin = false;
      state.year = Number(yearInput.value);
      applyFilters({ focusActive: true });
    });
  }

  function setYear(value, shouldFocus) {
    if (!yearInput) return;
    var nextYear = clamp(Number(value), Number(yearInput.getAttribute("min")), Number(yearInput.getAttribute("max")));
    if (shouldFocus) autoSpin = false;
    if (nextYear === state.year) {
      syncInputs();
      if (shouldFocus) focusActiveSite(state.module === "publication" ? 1.4 : 1.3);
      return;
    }
    state.year = nextYear;
    applyFilters({
      focusActive: Boolean(shouldFocus),
      zoom: state.module === "publication" ? 1.4 : 1.3
    });
  }

  buildYearWheel();

  yearButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var buttonYear = Number(button.getAttribute("data-globe-year"));
      var nextYear = buttonYear === state.year ? state.year - 1 : buttonYear;
      if (nextYear < minYear) nextYear = maxYear;
      setYear(nextYear, true);
    });
  });

  if (yearPanel && yearInput) {
    yearPanel.addEventListener("wheel", function (event) {
      event.preventDefault();
      var step = event.deltaY > 0 ? -1 : 1;
      setYear(state.year + step, true);
    }, { passive: false });

    yearPanel.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        setYear(state.year + 1, true);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        setYear(state.year - 1, true);
      }
    });
  }

  if (zoomInput) {
    zoomInput.addEventListener("input", function () {
      autoSpin = false;
      zoom = Number(zoomInput.value) / 100;
      syncInputs();
    });
  }

  function changeZoom(delta) {
    autoSpin = false;
    zoom = clamp(zoom + delta, .82, 1.72);
    syncInputs();
  }

  if (zoomIn) zoomIn.addEventListener("click", function () { changeZoom(.08); });
  if (zoomOut) zoomOut.addEventListener("click", function () { changeZoom(-.08); });

  canvas.addEventListener("pointerdown", function (event) {
    autoSpin = false;
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
