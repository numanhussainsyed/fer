// 🌗 Apply saved theme on load
function applySavedTheme() {
  const theme = localStorage.getItem('theme') || 'dark';
  document.body.classList.remove('light-theme', 'dark-theme');
  document.body.classList.add(theme + '-theme');
}

// 🌗 Toggle theme and save it
function setupThemeToggle() {
  const toggleBtn = document.getElementById('toggle-theme');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.classList.remove(currentTheme + '-theme');
    document.body.classList.add(newTheme + '-theme');
    localStorage.setItem('theme', newTheme);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applySavedTheme();
  setupThemeToggle();
});
