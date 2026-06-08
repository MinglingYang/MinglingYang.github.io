(function () {
  var choices = Array.prototype.slice.call(document.querySelectorAll("[data-language-choice]"));
  if (!choices.length) return;

  function setLanguage(lang) {
    choices.forEach(function (choice) {
      choice.classList.toggle("is-active", choice.getAttribute("data-language-choice") === lang);
    });
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    try {
      window.localStorage.setItem("mingling-language", lang);
    } catch (error) {
      return;
    }
  }

  choices.forEach(function (choice) {
    choice.addEventListener("click", function (event) {
      event.preventDefault();
      setLanguage(choice.getAttribute("data-language-choice") || "en");
    });
  });

  var saved = "en";
  try {
    saved = window.localStorage.getItem("mingling-language") || "en";
  } catch (error) {
    saved = "en";
  }
  setLanguage(saved === "zh" ? "zh" : "en");
})();
