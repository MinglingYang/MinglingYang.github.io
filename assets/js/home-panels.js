(function () {
  var landing = document.querySelector(".home-landing");
  var after = document.querySelector(".home-after-landing");
  if (!landing || !after) return;

  var transitionTimer = null;
  var animationFrame = null;
  var touchStartY = null;
  var isTransitioning = false;
  var cooldownUntil = 0;
  var transitionDuration = 560;

  function afterTop() {
    return window.pageYOffset + after.getBoundingClientRect().top;
  }

  function isNearLanding() {
    return window.pageYOffset < afterTop() * 0.52;
  }

  function isNearAfterTop() {
    return Math.abs(window.pageYOffset - afterTop()) < 70;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function finishTransition(targetTop) {
    window.scrollTo(0, Math.max(0, Math.round(targetTop)));
    isTransitioning = false;
    cooldownUntil = Date.now() + 260;
    document.body.classList.remove("is-home-panel-transition");
  }

  function animateScrollTo(targetTop) {
    var startTop = window.pageYOffset;
    var endTop = Math.max(0, Math.round(targetTop));
    var distance = endTop - startTop;
    var startTime = null;
    if (Math.abs(distance) < 2) {
      finishTransition(endTop);
      return;
    }
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishTransition(endTop);
      return;
    }
    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min(1, (timestamp - startTime) / transitionDuration);
      window.scrollTo(0, startTop + distance * easeInOutCubic(progress));
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        finishTransition(endTop);
      }
    }
    animationFrame = window.requestAnimationFrame(step);
  }

  function moveTo(targetTop) {
    window.clearTimeout(transitionTimer);
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    isTransitioning = true;
    document.body.classList.add("is-home-panel-transition");
    animateScrollTo(targetTop);
    transitionTimer = window.setTimeout(function () {
      if (isTransitioning) finishTransition(targetTop);
    }, transitionDuration + 160);
  }

  function goToLanding() {
    moveTo(0);
  }

  function goToAfter() {
    moveTo(afterTop());
  }

  window.addEventListener("wheel", function (event) {
    if (Math.abs(event.deltaY) < 18 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    if (isTransitioning || Date.now() < cooldownUntil) {
      event.preventDefault();
      return;
    }
    if (event.deltaY > 0 && isNearLanding()) {
      event.preventDefault();
      goToAfter();
    } else if (event.deltaY < 0 && isNearAfterTop()) {
      event.preventDefault();
      goToLanding();
    }
  }, { passive: false });

  window.addEventListener("keydown", function (event) {
    var downKeys = ["ArrowDown", "PageDown", " "];
    var upKeys = ["ArrowUp", "PageUp"];
    if ((isTransitioning || Date.now() < cooldownUntil) && (downKeys.indexOf(event.key) !== -1 || upKeys.indexOf(event.key) !== -1)) {
      event.preventDefault();
      return;
    }
    if (downKeys.indexOf(event.key) !== -1 && isNearLanding()) {
      event.preventDefault();
      goToAfter();
    } else if (upKeys.indexOf(event.key) !== -1 && isNearAfterTop()) {
      event.preventDefault();
      goToLanding();
    }
  });

  window.addEventListener("touchstart", function (event) {
    if (!event.touches || event.touches.length !== 1) return;
    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", function (event) {
    if (touchStartY === null || !event.changedTouches || event.changedTouches.length !== 1) return;
    var delta = touchStartY - event.changedTouches[0].clientY;
    touchStartY = null;
    if (Math.abs(delta) < 42) return;
    if (isTransitioning || Date.now() < cooldownUntil) return;
    if (delta > 0 && isNearLanding()) {
      goToAfter();
    } else if (delta < 0 && isNearAfterTop()) {
      goToLanding();
    }
  }, { passive: true });
})();
