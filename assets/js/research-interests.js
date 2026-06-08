(function () {
  function initResearchInterests() {
    var tiles = Array.prototype.slice.call(document.querySelectorAll(".research-interest-tile[href^='#interest-']"));
    if (!tiles.length) return;
    window.MINGLING_RESEARCH_INTERESTS_READY = tiles.length;

    var highlightTimer = null;

    function centerDetail(target) {
      var rect = target.getBoundingClientRect();
      var top = window.pageYOffset + rect.top - (window.innerHeight / 2) + (rect.height / 2);
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }

    function highlightDetail(target) {
      document.querySelectorAll(".research-interest__details article").forEach(function (article) {
        article.classList.remove("is-interest-highlight");
      });
      target.classList.add("is-interest-highlight");
      window.clearTimeout(highlightTimer);
      highlightTimer = window.setTimeout(function () {
        target.classList.remove("is-interest-highlight");
      }, 2600);
    }

    function openDetail(selector) {
      var target = selector ? document.querySelector(selector) : null;
      if (!target) return false;
      centerDetail(target);
      highlightDetail(target);
      if (window.history && window.history.pushState && window.location.hash !== selector) {
        window.history.pushState(null, "", selector);
      }
      return true;
    }

    tiles.forEach(function (tile) {
      tile.addEventListener("click", function (event) {
        var selector = tile.getAttribute("href");
        if (openDetail(selector)) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }, true);
    });

    window.addEventListener("hashchange", function () {
      if (window.location.hash && window.location.hash.indexOf("#interest-") === 0) {
        openDetail(window.location.hash);
      }
    });

    if (window.location.hash && window.location.hash.indexOf("#interest-") === 0) {
      window.setTimeout(function () {
        openDetail(window.location.hash);
      }, 120);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initResearchInterests);
  } else {
    initResearchInterests();
  }
})();
