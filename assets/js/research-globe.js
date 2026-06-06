(function () {
  var canvas = document.getElementById("research-globe-canvas");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var stage = canvas.parentElement;
  var activeCards = Array.prototype.slice.call(document.querySelectorAll("#research-globe-sites [data-location]"));

  var sites = [
    {
      id: "puno-peru",
      name: "Puno, Peru",
      lat: -15.84,
      lon: -70.02,
      color: "#2f78b7"
    },
    {
      id: "nepal",
      name: "Nepal",
      lat: 27.72,
      lon: 85.32,
      color: "#20a486"
    },
    {
      id: "peru-geco",
      name: "Peru",
      lat: -12.05,
      lon: -77.04,
      color: "#7c5cc4"
    },
    {
      id: "uganda",
      name: "Uganda",
      lat: 0.35,
      lon: 32.58,
      color: "#ef9b20"
    },
    {
      id: "guatemala",
      name: "Guatemala",
      lat: 14.63,
      lon: -90.51,
      color: "#d56a8a"
    },
    {
      id: "india",
      name: "India",
      lat: 20.59,
      lon: 78.96,
      color: "#4aa5d8"
    },
    {
      id: "rwanda",
      name: "Rwanda",
      lat: -1.94,
      lon: 30.06,
      color: "#82b84a"
    }
  ];

  var land = [
    [[-168, 72], [-135, 70], [-112, 54], [-95, 47], [-82, 32], [-96, 18], [-118, 22], [-137, 45]],
    [[-82, 13], [-66, 8], [-54, -8], [-58, -24], [-70, -55], [-78, -38], [-76, -12]],
    [[-10, 36], [8, 58], [42, 63], [78, 55], [112, 58], [145, 49], [124, 24], [77, 7], [38, 16], [20, 35]],
    [[-18, 33], [14, 34], [34, 16], [41, -3], [31, -30], [18, -35], [4, -20], [-8, 5]],
    [[68, 24], [90, 25], [96, 12], [79, 6], [72, 15]],
    [[112, -10], [154, -24], [144, -42], [116, -35]],
    [[-52, 76], [-22, 72], [-36, 60], [-58, 62]]
  ];

  var rotation = -18;
  var focusIndex = 0;
  var lastFocus = 0;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    var rect = stage.getBoundingClientRect();
    var width = Math.max(320, Math.floor(rect.width));
    var height = Math.max(360, Math.floor(rect.height || 420));
    var ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function project(lat, lon, width, height, radius) {
    var centerLat = 8 * Math.PI / 180;
    var phi = lat * Math.PI / 180;
    var lambda = (lon + rotation) * Math.PI / 180;
    var sinPhi = Math.sin(phi);
    var cosPhi = Math.cos(phi);
    var cosLambda = Math.cos(lambda);
    var visible = Math.sin(centerLat) * sinPhi + Math.cos(centerLat) * cosPhi * cosLambda > -0.05;
    return {
      x: width / 2 + radius * cosPhi * Math.sin(lambda),
      y: height / 2 - radius * (Math.cos(centerLat) * sinPhi - Math.sin(centerLat) * cosPhi * cosLambda),
      visible: visible
    };
  }

  function drawSphere(width, height, radius) {
    var gradient = ctx.createRadialGradient(width * .42, height * .36, radius * .2, width / 2, height / 2, radius);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(.58, "#eaf5fb");
    gradient.addColorStop(1, "#cfe2ef");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b8d0df";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  function drawGraticule(width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = "rgba(82, 116, 145, .22)";
    ctx.lineWidth = 1;

    for (var lat = -60; lat <= 60; lat += 30) {
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
    ctx.fillStyle = "rgba(101, 153, 126, .28)";
    ctx.strokeStyle = "rgba(54, 104, 92, .24)";
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

  function drawArcs(width, height, radius) {
    var links = [
      ["nepal", "peru-geco"],
      ["peru-geco", "uganda"],
      ["guatemala", "puno-peru"],
      ["puno-peru", "rwanda"],
      ["india", "rwanda"]
    ];
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
    ctx.clip();
    links.forEach(function (link) {
      var a = sites.filter(function (site) { return site.id === link[0]; })[0];
      var b = sites.filter(function (site) { return site.id === link[1]; })[0];
      var pa = project(a.lat, a.lon, width, height, radius);
      var pb = project(b.lat, b.lon, width, height, radius);
      if (!pa.visible || !pb.visible) return;
      ctx.strokeStyle = "rgba(47, 120, 183, .22)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.quadraticCurveTo(width / 2, height / 2 - radius * .38, pb.x, pb.y);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawSites(width, height, radius, time) {
    var visibleSites = [];
    sites.forEach(function (site, index) {
      var p = project(site.lat, site.lon, width, height, radius);
      if (!p.visible) return;
      visibleSites.push({ site: site, index: index, x: p.x, y: p.y });
      var pulse = 4 + Math.sin(time / 420 + index) * 1.5;
      ctx.fillStyle = site.color;
      ctx.strokeStyle = "rgba(255, 255, 255, .95)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5.5 + pulse * .28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(47, 120, 183, .12)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14 + pulse, 0, Math.PI * 2);
      ctx.fill();
    });

    if (time - lastFocus > 1600 && visibleSites.length) {
      focusIndex = visibleSites[0].index;
      lastFocus = time;
      updateCards();
    }
  }

  function updateCards() {
    activeCards.forEach(function (card) {
      card.classList.toggle("is-active", card.getAttribute("data-location") === sites[focusIndex].id);
    });
  }

  function render(time) {
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    var radius = Math.min(width, height) * .39;
    ctx.clearRect(0, 0, width, height);
    if (!reduceMotion) rotation += .08;
    drawSphere(width, height, radius);
    drawLand(width, height, radius);
    drawGraticule(width, height, radius);
    drawArcs(width, height, radius);
    drawSites(width, height, radius, time || 0);
    window.requestAnimationFrame(render);
  }

  activeCards.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      var id = card.getAttribute("data-location");
      sites.forEach(function (site, index) {
        if (site.id === id) focusIndex = index;
      });
      updateCards();
    });
  });

  resize();
  updateCards();
  window.addEventListener("resize", resize);
  window.requestAnimationFrame(render);
})();
