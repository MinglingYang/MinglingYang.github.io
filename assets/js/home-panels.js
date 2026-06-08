(function () {
  var landing = document.querySelector(".home-landing");
  var after = document.querySelector(".home-after-landing");
  if (!landing || !after) return;

  var transitionTimer = null;
  var touchStartY = null;
  var isTransitioning = false;

  function afterTop() {
    return window.pageYOffset + after.getBoundingClientRect().top;
  }

  function isNearLanding() {
    return window.pageYOffset < afterTop() * 0.52;
  }

  function isNearAfterTop() {
    return Math.abs(window.pageYOffset - afterTop()) < 70;
  }

  function moveTo(targetTop) {
    window.clearTimeout(transitionTimer);
    isTransitioning = true;
    document.body.classList.add("is-home-panel-transition");
    window.scrollTo({ top: Math.max(0, Math.round(targetTop)), behavior: "smooth" });
    transitionTimer = window.setTimeout(function () {
      isTransitioning = false;
      document.body.classList.remove("is-home-panel-transition");
    }, 760);
  }

  function goToLanding() {
    moveTo(0);
  }

  function goToAfter() {
    moveTo(afterTop());
  }

  window.addEventListener("wheel", function (event) {
    if (Math.abs(event.deltaY) < 18 || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    if (isTransitioning) {
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
    if (isTransitioning && (downKeys.indexOf(event.key) !== -1 || upKeys.indexOf(event.key) !== -1)) {
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
    if (isTransitioning) return;
    if (delta > 0 && isNearLanding()) {
      goToAfter();
    } else if (delta < 0 && isNearAfterTop()) {
      goToLanding();
    }
  }, { passive: true });
})();
