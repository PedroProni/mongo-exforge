(function () {
  var theme = 'dark';
  try {
    var stored = localStorage.getItem('exforge.theme');
    if (stored === 'light' || stored === 'dark') theme = stored;
  } catch (error) {}
  document.documentElement.setAttribute('data-theme', theme);
})();
