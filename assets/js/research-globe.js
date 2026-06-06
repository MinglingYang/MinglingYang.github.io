(function () {
  var canvas = document.getElementById("research-globe-canvas");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var globe = canvas.closest(".research-globe");
  var stage = canvas.closest(".research-globe__stage");
  var connectorLayer = globe && globe.querySelector(".research-globe__connectors");
  var rotationInput = document.getElementById("research-globe-rotation");
  var tiltInput = document.getElementById("research-globe-tilt");
  var cards = Array.prototype.slice.call(document.querySelectorAll("#research-globe-left [data-location], #research-globe-right [data-location]"));

  var sites = cards.map(function (card, index) {
    return {
      id: card.getAttribute("data-location"),
      name: card.querySelector("span") ? card.querySelector("span").textContent : "",
      lat: Number(card.getAttribute("data-lat")),
      lon: Number(card.getAttribute("data-lon")),
      card: card,
      index: index,
      color: ["#2f78b7", "#7c5cc4", "#d56a8a", "#20a486", "#ef9b20", "#4aa5d8", "#82b84a"][index % 7]
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

  var rotation = rotationInput ? Number(rotationInput.value) : -25;
  var tilt = tiltInput ? Number(tiltInput.value) : 8;
  var activeId = "puno-peru";
  var markerPositions = {};
  var isDragging = false;
  var dragStart = null;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    var rect = stage.getBoundingClientRect();
    var width = Math.max(320, Math.floor(rect.width));
    var height = Math.max(356, Math.floor(rect.height - 74));
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

  function syncInputs() {
    if (rotationInput) rotationInput.value = String(Math.round(normalizeRotation(rotation)));
    if (tiltInput) tiltInput.value = String(Math.round(tilt));
  }

  function normalizeRotation(value) {
    var next = ((value + 180) % 360 + 360) % 360 - 180;
    return next;
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
    atmosphere.addColorStop(0, "rgba(47, 120, 183, 0)");
    atmosphere.addColorStop(1, "rgba(47, 120, 183, .18)");
    ctx.fillStyle = atmosphere;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius * 1.18, 0, Math.PI * 2);
    ctx.fill();

    var gradient = ctx.createRadialGradient(width * .42, height * .34, radius * .12, width / 2, height / 2, radius);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(.5, "#eaf7ff");
    gradient.addColorStop(1, "#c6dceb");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#9fc2d8";
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }

  function drawGraticule(width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = "rgba(56, 92, 124, .24)";
    ctx.lineWidth = 1;

    for (var lat = -60; lat <= 60; lat += 20) {
      drawLine(function (lon) { return [lat, lon]; }, -180, 180, width, height, radius);
    }
    for (var lon = -150; lon <= 180; lon += 30) {
      drawLine(function (lat) { return [lat, lon]; }, -80, 80, width, height, radius);
    }
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

  function drawLand(width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(86, 146, 124, .28)";
    ctx.strokeStyle = "rgba(39, 92, 87, .25)";
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
    ctx.strokeStyle = "rgba(47, 120, 183, .13)";
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
    sites.forEach(function (site) {
      var p = project(site.lat, site.lon, width, height, radius);
      if (!p.visible) return;
      markerPositions[site.id] = { x: p.x, y: p.y };
      var active = site.id === activeId;
      var pulse = active ? 7 + Math.sin(time / 220) * 2 : 3 + Math.sin(time / 520 + site.index) * 1.2;
      ctx.fillStyle = "rgba(47, 120, 183, .12)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = site.color;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = active ? 3 : 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, active ? 7.5 : 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
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
    sites.forEach(function (site) {
      var marker = markerPositions[site.id];
      if (!marker) return;
      var cardRect = site.card.getBoundingClientRect();
      var startX = canvasRect.left - globeRect.left + marker.x;
      var startY = canvasRect.top - globeRect.top + marker.y;
      var cardOnLeft = cardRect.left < canvasRect.left;
      var endX = (cardOnLeft ? cardRect.right : cardRect.left) - globeRect.left;
      var endY = cardRect.top - globeRect.top + Math.min(28, cardRect.height / 2);
      var bendX = cardOnLeft ? startX - 46 : startX + 46;
      var color = site.id === activeId ? "#2f78b7" : "rgba(84, 125, 160, .34)";
      var width = site.id === activeId ? 2.2 : 1.1;
      paths.push("<path d=\"M" + startX.toFixed(1) + " " + startY.toFixed(1) + " C " + bendX.toFixed(1) + " " + startY.toFixed(1) + ", " + bendX.toFixed(1) + " " + endY.toFixed(1) + ", " + endX.toFixed(1) + " " + endY.toFixed(1) + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"" + width + "\" stroke-linecap=\"round\"/>");
      if (site.id === activeId) {
        paths.push("<circle cx=\"" + endX.toFixed(1) + "\" cy=\"" + endY.toFixed(1) + "\" r=\"3.2\" fill=\"#2f78b7\"/>");
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
      if (dist < 24 && (!best || dist < best.dist)) best = { id: id, dist: dist };
    });
    return best && best.id;
  }

  function render(time) {
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    var radius = Math.min(width, height) * .39;
    ctx.clearRect(0, 0, width, height);
    if (!reduceMotion && !isDragging) rotation += .025;
    drawOrbits(width, height, radius);
    drawSphere(width, height, radius);
    drawLand(width, height, radius);
    drawGraticule(width, height, radius);
    drawSites(width, height, radius, time || 0);
    updateConnectors();
    window.requestAnimationFrame(render);
  }

  cards.forEach(function (card) {
    card.setAttribute("tabindex", "0");
    card.addEventListener("click", function () {
      setActive(card.getAttribute("data-location"));
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActive(card.getAttribute("data-location"));
      }
    });
  });

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
  updateCards();
  window.requestAnimationFrame(render);
})();
