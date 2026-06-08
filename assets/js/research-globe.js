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
  var renderRotation = rotation;
  var renderTilt = tilt;
  var zoom = zoomInput ? Number(zoomInput.value) / 100 : 1;
  var activeId = "peru";
  var visibleSites = [];
  var markerPositions = {};
  var isDragging = false;
  var dragStart = null;
  var autoSpin = true;
  var lastFrameTime = 0;
  var spinPausedUntil = 0;
  var timeWheelArmed = false;

  function versionedAssetUrl(url) {
    var version = window.MINGLING_ASSET_VERSION;
    if (!version) return url;
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "v=" + encodeURIComponent(version);
  }

  function createImageAsset(src) {
    var asset = {
      image: new Image(),
      ready: false,
      width: 0,
      height: 0
    };
    asset.image.onload = function () {
      asset.width = asset.image.naturalWidth || asset.image.width;
      asset.height = asset.image.naturalHeight || asset.image.height;
      asset.ready = true;
    };
    asset.image.src = src;
    return asset;
  }

  function createRasterTexture(src) {
    var texture = {
      canvas: null,
      data: null,
      image: new Image(),
      ready: false,
      width: 0,
      height: 0
    };
    texture.image.onload = function () {
      texture.canvas = document.createElement("canvas");
      texture.width = texture.image.naturalWidth || texture.image.width;
      texture.height = texture.image.naturalHeight || texture.image.height;
      texture.canvas.width = texture.width;
      texture.canvas.height = texture.height;
      var textureCtx = texture.canvas.getContext("2d");
      textureCtx.drawImage(texture.image, 0, 0, texture.width, texture.height);
      texture.data = textureCtx.getImageData(0, 0, texture.width, texture.height).data;
      texture.ready = true;
    };
    texture.image.src = src;
    return texture;
  }

  var earthTexture = createRasterTexture(versionedAssetUrl("/assets/images/earth-blue-marble-topography.jpg"));
  var populationTexture = createRasterTexture(versionedAssetUrl("/assets/images/earth-night-lights-population.jpg"));
  var spaceBackdrop = createImageAsset(versionedAssetUrl("/assets/images/space-deep-field.jpg"));
  var textureFrameCanvas = document.createElement("canvas");
  var textureFrameCtx = textureFrameCanvas.getContext("2d");
  var textureFrameSignature = "";

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

  function pauseSpin(duration) {
    spinPausedUntil = Math.max(spinPausedUntil, Date.now() + (duration || 9000));
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
    if (siteHasModule(site, "education")) return "#ffd166";
    if (siteHasModule(site, "presentation")) return "#ff5ab3";
    if (count >= 4) return "#ffb02e";
    if (count >= 2) return "#9b5cff";
    if (count === 1) return "#42f59b";
    return "#8ca3b0";
  }

  function markerHaloColor(site, active) {
    if (siteHasModule(site, "education")) return active ? "rgba(255, 209, 102, .32)" : "rgba(255, 209, 102, .16)";
    if (siteHasModule(site, "presentation")) return active ? "rgba(255, 90, 179, .32)" : "rgba(255, 90, 179, .16)";
    if (site.count >= 4) return active ? "rgba(255, 176, 46, .3)" : "rgba(255, 176, 46, .16)";
    if (site.count >= 2) return active ? "rgba(155, 92, 255, .3)" : "rgba(155, 92, 255, .16)";
    if (site.count === 1) return active ? "rgba(66, 245, 155, .3)" : "rgba(66, 245, 155, .16)";
    return active ? "rgba(140, 163, 176, .24)" : "rgba(140, 163, 176, .12)";
  }

  function markerRadius(count, active) {
    var base = count >= 4 ? 8 : count >= 2 ? 7 : count === 1 ? 6 : 5.5;
    return active ? base + 2 : base;
  }

  function countryFill(count, active) {
    if (active && count >= 4) return "rgba(255, 176, 46, .42)";
    if (active && count >= 2) return "rgba(155, 92, 255, .36)";
    if (active && count === 1) return "rgba(66, 245, 155, .32)";
    if (active && state.module === "education") return "rgba(255, 209, 102, .3)";
    if (active && state.module === "presentation") return "rgba(255, 90, 179, .34)";
    if (count >= 4) return "rgba(255, 176, 46, .34)";
    if (count >= 2) return "rgba(155, 92, 255, .28)";
    if (count === 1) return "rgba(66, 245, 155, .24)";
    return "rgba(14, 52, 66, .12)";
  }

  function countryStroke(count, active) {
    if (active && count >= 4) return "rgba(255, 238, 190, .98)";
    if (active && count >= 2) return "rgba(232, 220, 255, .98)";
    if (active && count === 1) return "rgba(215, 255, 232, .98)";
    if (active && state.module === "education") return "rgba(255, 238, 190, .98)";
    if (active && state.module === "presentation") return "rgba(255, 214, 236, .98)";
    if (active) return "rgba(103, 232, 255, .9)";
    if (count >= 4) return "rgba(255, 176, 46, .86)";
    if (count >= 2) return "rgba(155, 92, 255, .78)";
    if (count > 0) return "rgba(66, 245, 155, .78)";
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

  function scrollToPageTarget(hash, attempts) {
    var id = String(hash || "").replace(/^#/, "");
    var target = id ? document.getElementById(id) : null;
    if (!target) {
      if (attempts > 0) {
        window.setTimeout(function () {
          scrollToPageTarget(hash, attempts - 1);
        }, 120);
      }
      return;
    }
    var top = target.getBoundingClientRect().top + window.pageYOffset - 96;
    if (window.history && window.history.pushState) {
      window.history.pushState(null, "", "#" + id);
    } else {
      window.location.hash = id;
    }
    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth"
    });
  }

  function handleInternalJumpClick(event) {
    var link = event.target.closest && event.target.closest(".research-globe__article-list a[href^='#publication-'], .research-globe__jump-link[href^='#presentation-']");
    if (!link || !globe || !globe.contains(link)) return;
    event.preventDefault();
    event.stopPropagation();
    scrollToPageTarget(link.getAttribute("href"), 12);
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
    if (!rightColumn) return;
    if (leftColumn) leftColumn.innerHTML = "";
    rightColumn.innerHTML = "";
    var displaySites = visibleSites.filter(function (site) {
      return site.id === activeId;
    });
    if (!displaySites.length && visibleSites.length) displaySites = [visibleSites[0]];
    displaySites.forEach(function (site) {
      site.card.classList.remove("is-hidden");
      rightColumn.appendChild(site.card);
    });
    sites.forEach(function (site) {
      if (displaySites.indexOf(site) === -1) site.card.classList.add("is-hidden");
    });
    resize();
  }

  function project(lat, lon, width, height, radius) {
    var centerLat = renderTilt * Math.PI / 180;
    var phi = lat * Math.PI / 180;
    var lambda = (lon + renderRotation) * Math.PI / 180;
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

  function drawStarfield(width, height, radius) {
    ctx.save();
    ctx.fillStyle = "#020712";
    ctx.fillRect(0, 0, width, height);
    if (spaceBackdrop.ready) {
      var scale = Math.max(width / spaceBackdrop.width, height / spaceBackdrop.height);
      var drawWidth = spaceBackdrop.width * scale;
      var drawHeight = spaceBackdrop.height * scale;
      var drawX = (width - drawWidth) / 2;
      var drawY = (height - drawHeight) / 2;
      ctx.globalAlpha = .78;
      ctx.drawImage(spaceBackdrop.image, drawX, drawY, drawWidth, drawHeight);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(1, 7, 18, .36)";
      ctx.fillRect(0, 0, width, height);
    }
    var nebula = ctx.createRadialGradient(width * .78, height * .18, 0, width * .78, height * .18, Math.max(width, height) * .62);
    nebula.addColorStop(0, "rgba(0, 213, 255, .1)");
    nebula.addColorStop(.42, "rgba(43, 101, 255, .045)");
    nebula.addColorStop(1, "rgba(2, 7, 18, 0)");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height);
    var vignette = ctx.createRadialGradient(width / 2, height / 2, radius * .58, width / 2, height / 2, Math.max(width, height) * .68);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(.7, "rgba(0, 4, 16, .14)");
    vignette.addColorStop(1, "rgba(0, 4, 16, .5)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
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

  function sampleTexture(texture, longitude, latitude) {
    if (!texture.ready || !texture.data) return null;
    var textureX = Math.floor((longitude + 180) / 360 * (texture.width - 1));
    var textureY = Math.floor((90 - latitude) / 180 * (texture.height - 1));
    var index = (textureY * texture.width + textureX) * 4;
    return [texture.data[index], texture.data[index + 1], texture.data[index + 2]];
  }

  function drawEarthTexture(width, height, radius) {
    if (!earthTexture.ready || !earthTexture.data || !textureFrameCtx) return;
    var renderScale = Math.min(1.35, 980 / Math.max(width, 1));
    var renderWidth = Math.max(520, Math.round(width * renderScale));
    var renderHeight = Math.max(390, Math.round(height * renderScale));
    var renderRadius = radius * renderWidth / width;
    var signature = [
      renderWidth,
      renderHeight,
      Math.round(renderRadius),
      renderRotation.toFixed(2),
      renderTilt.toFixed(2)
    ].join(":");
    if (textureFrameCanvas.width && textureFrameSignature === signature) {
      ctx.drawImage(textureFrameCanvas, 0, 0, width, height);
      return;
    }
    if (textureFrameCanvas.width !== renderWidth || textureFrameCanvas.height !== renderHeight) {
      textureFrameCanvas.width = renderWidth;
      textureFrameCanvas.height = renderHeight;
    }
    var frame = textureFrameCtx.createImageData(renderWidth, renderHeight);
    var output = frame.data;
    var centerX = renderWidth / 2;
    var centerY = renderHeight / 2;
    var minX = Math.max(0, Math.floor(centerX - renderRadius));
    var maxX = Math.min(renderWidth - 1, Math.ceil(centerX + renderRadius));
    var minY = Math.max(0, Math.floor(centerY - renderRadius));
    var maxY = Math.min(renderHeight - 1, Math.ceil(centerY + renderRadius));
    var tiltRadians = renderTilt * Math.PI / 180;
    var sinTilt = Math.sin(tiltRadians);
    var cosTilt = Math.cos(tiltRadians);
    for (var y = minY; y <= maxY; y += 1) {
      var normalizedY = (centerY - (y + .5)) / renderRadius;
      for (var x = minX; x <= maxX; x += 1) {
        var normalizedX = ((x + .5) - centerX) / renderRadius;
        var distance = normalizedX * normalizedX + normalizedY * normalizedY;
        if (distance > 1) continue;
        var z = Math.sqrt(1 - distance);
        var sinPhi = clamp(cosTilt * normalizedY + sinTilt * z, -1, 1);
        var cosPhiCosLambda = -sinTilt * normalizedY + cosTilt * z;
        var latitude = Math.asin(sinPhi) * 180 / Math.PI;
        var longitude = normalizeRotation(Math.atan2(normalizedX, cosPhiCosLambda) * 180 / Math.PI - renderRotation);
        var earthSample = sampleTexture(earthTexture, longitude, latitude);
        if (!earthSample) continue;
        var populationSample = sampleTexture(populationTexture, longitude, latitude);
        var populationSignal = 0;
        if (populationSample) {
          var nightLum = populationSample[0] * .5 + populationSample[1] * .95 + populationSample[2] * .22;
          populationSignal = clamp((nightLum - 48) / 160, 0, 1);
          populationSignal = Math.pow(populationSignal, .72);
        }
        var targetIndex = (y * renderWidth + x) * 4;
        var depth = .52 + z * .48;
        var haze = (1 - z) * .22;
        var baseRed = earthSample[0] * .3 * depth + 4;
        var baseGreen = earthSample[1] * .48 * depth + 12;
        var baseBlue = earthSample[2] * .98 * depth + 36 + haze * 42;
        var glowStrength = populationSignal * (.28 + z * .68);
        output[targetIndex] = clamp(baseRed + glowStrength * 168, 0, 255);
        output[targetIndex + 1] = clamp(baseGreen + glowStrength * 142, 0, 255);
        output[targetIndex + 2] = clamp(baseBlue + glowStrength * 38, 0, 255);
        output[targetIndex + 3] = 232;
      }
    }
    textureFrameCtx.putImageData(frame, 0, 0);
    textureFrameSignature = signature;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(textureFrameCanvas, 0, 0, width, height);
  }

  function drawGlobeLighting(width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalCompositeOperation = "screen";
    var highlight = ctx.createRadialGradient(width * .36, height * .28, radius * .08, width * .38, height * .3, radius * .82);
    highlight.addColorStop(0, "rgba(170, 245, 255, .24)");
    highlight.addColorStop(.38, "rgba(74, 211, 246, .08)");
    highlight.addColorStop(1, "rgba(0, 213, 255, 0)");
    ctx.fillStyle = highlight;
    ctx.fillRect(width / 2 - radius, height / 2 - radius, radius * 2, radius * 2);
    ctx.globalCompositeOperation = "source-over";
    var shade = ctx.createRadialGradient(width * .38, height * .3, radius * .14, width * .62, height * .6, radius * 1.1);
    shade.addColorStop(0, "rgba(0, 0, 0, 0)");
    shade.addColorStop(.56, "rgba(0, 0, 0, .03)");
    shade.addColorStop(1, "rgba(0, 0, 0, .34)");
    ctx.fillStyle = shade;
    ctx.fillRect(width / 2 - radius, height / 2 - radius, radius * 2, radius * 2);
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

  function drawArrowHead(from, to, color) {
    var angle = Math.atan2(to.y - from.y, to.x - from.x);
    var size = 8.5;
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
    }).filter(function (point) {
      return point.visible;
    });
    if (points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 209, 102, .86)";
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "rgba(255, 209, 102, .58)";
    ctx.shadowBlur = 12;
    for (var i = 0; i < points.length - 1; i += 1) {
      var start = points[i];
      var end = points[i + 1];
      var midX = (start.x + end.x) / 2;
      var midY = (start.y + end.y) / 2 - 26;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(midX, midY, end.x, end.y);
      ctx.stroke();
      drawArrowHead({ x: midX, y: midY }, end, "rgba(255, 224, 146, .96)");
    }
    ctx.restore();
  }

  function drawSites(width, height, radius) {
    markerPositions = {};
    visibleSites.forEach(function (site) {
      var p = project(site.lat, site.lon, width, height, radius);
      if (!p.visible) return;
      markerPositions[site.id] = { x: p.x, y: p.y };
      var active = site.id === activeId;
      var dotRadius = markerRadius(site.count, active);
      ctx.fillStyle = markerHaloColor(site, active);
      ctx.beginPath();
      ctx.arc(p.x, p.y, (active ? 18 : 13) + site.count * 1.35, 0, Math.PI * 2);
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
      pauseSpin(9000);
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
    pauseSpin(9000);
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
    pauseSpin(9000);
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

  function render() {
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    var radius = Math.min(width, height) * .36 * zoom;
    var now = Date.now();
    var delta = lastFrameTime ? Math.min(40, now - lastFrameTime) : 16;
    lastFrameTime = now;
    if (autoSpin && !isDragging && now > spinPausedUntil) {
      rotation = normalizeRotation(rotation + delta * .0006);
    }
    renderRotation = normalizeRotation(rotation);
    renderTilt = tilt;
    ctx.clearRect(0, 0, width, height);
    drawStarfield(width, height, radius);
    drawSphere(width, height, radius);
    drawEarthTexture(width, height, radius);
    drawGlobeLighting(width, height, radius);
    drawLand(width, height, radius);
    drawGraticule(width, height, radius);
    drawEducationPath(width, height, radius);
    drawSites(width, height, radius);
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

  if (globe) {
    globe.addEventListener("click", handleInternalJumpClick, true);
  }

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
      state.year = Number(yearInput.value);
      applyFilters({ focusActive: true });
    });
  }

  function setYear(value, shouldFocus) {
    if (!yearInput) return;
    var nextYear = clamp(Number(value), Number(yearInput.getAttribute("min")), Number(yearInput.getAttribute("max")));
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

  function armTimeWheel() {
    if (!yearPanel) return;
    timeWheelArmed = true;
    yearPanel.classList.add("is-active");
    if (yearPanel.focus) yearPanel.focus({ preventScroll: true });
  }

  function disarmTimeWheel() {
    timeWheelArmed = false;
    if (yearPanel) yearPanel.classList.remove("is-active");
  }

  function handleTimeWheel(event) {
    event.preventDefault();
    event.stopPropagation();
    pauseSpin(3500);
    var step = event.deltaY > 0 ? -1 : 1;
    setYear(state.year + step, true);
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
    yearPanel.addEventListener("click", function (event) {
      event.stopPropagation();
      armTimeWheel();
      var rect = yearPanel.getBoundingClientRect();
      var centerY = rect.top + rect.height / 2;
      setYear(state.year + (event.clientY > centerY ? -1 : 1), true);
    });

    yearPanel.addEventListener("wheel", handleTimeWheel, { passive: false });

    yearPanel.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        armTimeWheel();
        setYear(state.year + 1, true);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        armTimeWheel();
        setYear(state.year - 1, true);
      }
      if (event.key === "Escape") {
        disarmTimeWheel();
      }
    });
  }

  window.addEventListener("click", function (event) {
    if (!yearPanel || yearPanel.contains(event.target)) return;
    disarmTimeWheel();
  });

  window.addEventListener("wheel", function (event) {
    if (!timeWheelArmed || !yearPanel) return;
    handleTimeWheel(event);
  }, { passive: false });

  if (zoomInput) {
    zoomInput.addEventListener("input", function () {
      zoom = Number(zoomInput.value) / 100;
      syncInputs();
    });
  }

  function changeZoom(delta) {
    pauseSpin(3000);
    zoom = clamp(zoom + delta, .82, 1.72);
    syncInputs();
  }

  if (zoomIn) zoomIn.addEventListener("click", function () { changeZoom(.08); });
  if (zoomOut) zoomOut.addEventListener("click", function () { changeZoom(-.08); });

  canvas.addEventListener("pointerdown", function (event) {
    pauseSpin(8000);
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
