const params = new URLSearchParams(window.location.search);

const image = document.querySelector('[data-viewer-image]');
const stage = document.querySelector('[data-viewer-stage]');
const loading = document.querySelector('[data-viewer-loading]');
const errorPanel = document.querySelector('[data-viewer-error]');
const zoomLabel = document.querySelector('[data-zoom-level]');
const downloadLink = document.querySelector('[data-download]');
const fullscreenToggle = document.querySelector('[data-fullscreen-toggle]');
const previousButton = document.querySelector('[data-previous]');
const nextButton = document.querySelector('[data-next]');
const appShell = document.querySelector('.app-shell');
const photoList = Array.isArray(window.RONOVA_PHOTOS) ? window.RONOVA_PHOTOS : [];
let immersiveMode = false;

async function resolveImageUrl() {
  if (params.get('random') === '1') {
    loading.textContent = '正在抽取随机图片…';
    const response = await fetch('/api', { method: 'HEAD', redirect: 'follow', cache: 'no-store' });
    if (!response.ok) throw new Error('Could not choose a random image');
    const randomUrl = new URL(response.url);
    if (randomUrl.origin !== window.location.origin || !randomUrl.pathname.startsWith('/photos/')) {
      throw new Error('The random image URL is invalid');
    }
    window.history.replaceState(null, '', `${window.location.pathname}?src=${encodeURIComponent(randomUrl.pathname)}`);
    return randomUrl;
  }

  const requestedPath = params.get('src');
  if (!requestedPath) return null;
  const requestedUrl = new URL(requestedPath, window.location.origin);
  if (requestedUrl.origin !== window.location.origin || !requestedUrl.pathname.startsWith('/photos/')) return null;
  return requestedUrl;
}

function setError() {
  loading.hidden = true;
  image.hidden = true;
  stage.classList.add('has-error');
  errorPanel.hidden = false;
  document.title = '图片无法打开 · Ronova';
}

function showImage(imageUrl) {
  if (!imageUrl) {
    setError();
    return;
  }

  const pathname = imageUrl.pathname;
  const currentIndex = photoList.indexOf(pathname);
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

  const navigate = (offset) => {
    if (currentIndex < 0 || photoList.length < 2) return;
    const nextIndex = (currentIndex + offset + photoList.length) % photoList.length;
    window.location.href = `/photo-viewer?src=${encodeURIComponent(photoList[nextIndex])}`;
  };
  if (previousButton && nextButton) {
    previousButton.disabled = currentIndex < 0 || photoList.length < 2;
    nextButton.disabled = currentIndex < 0 || photoList.length < 2;
    previousButton.addEventListener('click', () => navigate(-1));
    nextButton.addEventListener('click', () => navigate(1));
  }

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
    if (zoom > 1) enterImmersiveMode();
    if (zoom <= 1 && immersiveMode) exitImmersiveMode();
  };
  function syncFullscreenState() {
    const isFullscreen = document.fullscreenElement === appShell;
    const active = isFullscreen || immersiveMode;
    document.body.classList.toggle('is-fullscreen', active);
    fullscreenToggle.setAttribute('aria-label', active ? '退出全屏' : '进入全屏');
    fullscreenToggle.title = active ? '退出全屏（F 或 Esc）' : '进入全屏（F）';
    fullscreenToggle.innerHTML = active
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3v5H3m18 0h-5V3M3 16h5v5m13-5h-5v5" /></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3" /></svg>';
  }
  function enterImmersiveMode() {
    immersiveMode = true;
    syncFullscreenState();
    if (!document.fullscreenElement && appShell.requestFullscreen) {
      appShell.requestFullscreen().catch(() => {});
    }
  }
  function exitImmersiveMode() {
    immersiveMode = false;
    syncFullscreenState();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }
  fullscreenToggle.addEventListener('click', () => {
    if (document.body.classList.contains('is-fullscreen')) exitImmersiveMode();
    else enterImmersiveMode();
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) immersiveMode = false;
    syncFullscreenState();
  });
  document.querySelector('[data-zoom-in]').addEventListener('click', () => setZoom(zoom + 0.25));
  document.querySelector('[data-zoom-out]').addEventListener('click', () => setZoom(zoom - 0.25));
  document.querySelector('[data-zoom-reset]').addEventListener('click', () => {
    setZoom(1);
  });
  stage.addEventListener('wheel', (event) => {
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? 0.15 : -0.15));
  }, { passive: false });
  window.addEventListener('keydown', (event) => {
    if (event.key === '+' || event.key === '=') setZoom(zoom + 0.25);
    if (event.key === '-' || event.key === '_') setZoom(zoom - 0.25);
    if (event.key === '0') {
      setZoom(1);
    }
    if (event.key === 'ArrowLeft') navigate(-1);
    if (event.key === 'ArrowRight') navigate(1);
    if (event.key.toLowerCase() === 'f') {
      if (document.body.classList.contains('is-fullscreen')) exitImmersiveMode();
      else enterImmersiveMode();
    }
    if (event.key === 'Escape' && document.body.classList.contains('is-fullscreen')) exitImmersiveMode();
  });
}

resolveImageUrl().then(showImage).catch(setError);
