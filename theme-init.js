(function initThemeBeforePaint() {
  var storageKey = "url-cleaner.theme";
  var preference = null;
  try {
    var stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark") preference = stored;
  } catch {
    preference = null;
  }

  var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = preference === "light" || preference === "dark"
    ? preference
    : systemDark
      ? "dark"
      : "light";

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#141414" : "#ffffff");
  }
})();
