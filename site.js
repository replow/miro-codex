const themeToggle = document.querySelector('[data-theme-toggle]');
const themeIcon = themeToggle?.querySelector('[data-theme-icon]');

function updateThemeButton() {
  if (!themeToggle || !themeIcon) return;
  const isDark = document.documentElement.dataset.theme === 'dark';
  themeToggle.setAttribute('aria-label', isDark ? '切换浅色模式' : '切换深色模式');
  themeToggle.title = isDark ? '切换浅色模式' : '切换深色模式';
  themeIcon.innerHTML = isDark
    ? '<path d="M12 3v2m0 14v2M3 12h2m14 0h2m-3.4-6.6-1.4 1.4M7.8 16.2l-1.4 1.4m0-11.2 1.4 1.4m8.4 8.4 1.4 1.4" /><circle cx="12" cy="12" r="3.5" />'
    : '<path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5 8.5 8.5 0 1 0 20.5 14.6Z" />';
}

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem('ronova-theme', nextTheme);
  updateThemeButton();
});
updateThemeButton();

const grid = document.querySelector('.photo-grid');
const searchInput = document.querySelector('[data-photo-search]');
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const countLabel = document.querySelector('[data-photo-count]');
const photoLinks = [...document.querySelectorAll('.photo-link')];
let selectedFilter = 'all';

function orientationOf(link) {
  const img = link.querySelector('img');
  if (!img?.naturalWidth || !img.naturalHeight) return 'landscape';
  const ratio = img.naturalWidth / img.naturalHeight;
  if (ratio > 1.12) return 'landscape';
  if (ratio < 0.88) return 'portrait';
  return 'square';
}

function applyGalleryFilters() {
  const query = searchInput?.value.trim().toLowerCase() || '';
  let visible = 0;
  photoLinks.forEach((link) => {
    const matchesName = !query || link.dataset.photoName.includes(query);
    const matchesFilter = selectedFilter === 'all' || orientationOf(link) === selectedFilter;
    const show = matchesName && matchesFilter;
    link.hidden = !show;
    if (show) visible += 1;
  });
  if (countLabel) countLabel.textContent = visible;
  grid?.classList.toggle('is-filtered', selectedFilter !== 'all' || Boolean(query));
}

filterButtons.forEach((button) => button.addEventListener('click', () => {
  selectedFilter = button.dataset.filter;
  filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  applyGalleryFilters();
}));
searchInput?.addEventListener('input', applyGalleryFilters);
photoLinks.forEach((link) => link.querySelector('img')?.addEventListener('load', applyGalleryFilters));
applyGalleryFilters();
