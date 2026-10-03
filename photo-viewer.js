const params = new URLSearchParams(window.location.search);
const requestedPath = params.get('src');
const imageUrl = requestedPath ? new URL(requestedPath, window.location.origin) : null;

const image = document.querySelector('[data-viewer-image]');
const stage = document.querySelector('[data-viewer-stage]');
const loading = document.querySelector('[data-viewer-loading]');
const errorPanel = document.querySelector('[data-viewer-error]');
const zoomLabel = document.querySelector('[data-zoom-level]');
const downloadLink = document.querySelector('[data-download]');

function setError() {
  loading.hidden = true;
  image.hidden = true;
  stage.classList.add('has-error');
  errorPanel.hidden = false;
  document.title = '图片无法打开 · Ronova';
}

if (!imageUrl || imageUrl.origin !== window.location.origin || !imageUrl.pathname.startsWith('/photos/')) {
  setError();
} else {
  const pathname = imageUrl.pathname;
  const filename = decodeURIComponent(pathname.split('/').pop() || '图片');
  const extension = filename.includes('.') ? filename.split('.').pop().toUpperCase() : '未知';
  const nameWithoutExtension = filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');

  document.querySelector('[data-image-name]').textContent = nameWithoutExtension;
  document.querySelector('[data-image-filename]').textContent = filename;
  document.querySelector('[data-image-format]').textContent = extension;
  document.title = `${nameWithoutExtension} · Ronova`;
  downloadLink.href = imageUrl.href;
  downloadLink.download = filename;
  image.src = imageUrl.href;
  image.alt = nameWithoutExtension;

  image.addEventListener('load', () => {
    loading.hidden = true;
    image.hidden = false;
    document.querySelector('[data-image-dimensions]').textContent = `${image.naturalWidth} × ${image.naturalHeight} px`;
  }, { once: true });
  image.addEventListener('error', setError, { once: true });

  fetch(imageUrl.href, { method: 'HEAD' })
    .then((response) => {
      if (!response.ok) throw new Error('Could not read image headers');
      const bytes = Number(response.headers.get('content-length'));
      if (!Number.isFinite(bytes) || bytes <= 0) throw new Error('Image size is unavailable');
      const units = ['B', 'KB', 'MB', 'GB'];
      const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
      const size = bytes / (1024 ** unitIndex);
      document.querySelector('[data-image-size]').textContent = `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
    })
    .catch(() => {
      document.querySelector('[data-image-size]').textContent = '暂不可用';
    });

  let zoom = 1;
  const setZoom = (nextZoom) => {
    zoom = Math.min(4, Math.max(0.5, nextZoom));
    image.style.transform = `scale(${zoom})`;
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
  };
  document.querySelector('[data-zoom-in]').addEventListener('click', () => setZoom(zoom + 0.25));
  document.querySelector('[data-zoom-out]').addEventListener('click', () => setZoom(zoom - 0.25));
  document.querySelector('[data-zoom-reset]').addEventListener('click', () => setZoom(1));
  stage.addEventListener('wheel', (event) => {
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? 0.15 : -0.15));
  }, { passive: false });
  window.addEventListener('keydown', (event) => {
    if (event.key === '+' || event.key === '=') setZoom(zoom + 0.25);
    if (event.key === '-' || event.key === '_') setZoom(zoom - 0.25);
    if (event.key === '0') setZoom(1);
    if (event.key === 'Escape') window.location.href = '/';
  });
}
