// Two-click embeds (layouts/_partials/embed.html): the <iframe> of a third
// party is created only when the reader presses the button, so nothing is
// requested from the provider before that.
//
// A reader who ticks "immer laden" has the provider remembered in
// localStorage; its embeds then load right away on every page. The button
// of the embed-reset shortcode forgets them again.
const STORAGE_KEY = 'embed-consent';

// localStorage throws where site data is blocked; the embeds then simply
// ask every time.
function remembered(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function remember(provider: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set([...remembered(), provider])]));
  } catch {}
}

function load(box: HTMLElement): HTMLIFrameElement {
  const { src, title, height, width } = box.dataset;
  const iframe = document.createElement('iframe');
  iframe.className = 'embed-frame';
  iframe.loading = 'lazy';
  iframe.src = src ?? '';
  iframe.title = title ?? '';
  iframe.height = height ?? '500';
  if (width) iframe.style.maxWidth = `${width}px`;
  iframe.allowFullscreen = true;
  box.replaceWith(iframe);
  return iframe;
}

const boxes = [...document.querySelectorAll<HTMLElement>('.embed-consent')];
const allowed = remembered();

for (const box of boxes) {
  const provider = box.dataset.provider ?? '';
  if (allowed.includes(provider)) {
    load(box);
    continue;
  }

  const button = box.querySelector('button');
  const checkbox = box.querySelector('input');
  for (const el of box.querySelectorAll<HTMLElement>('[hidden]')) el.hidden = false;

  button?.addEventListener('click', () => {
    if (checkbox?.checked) {
      remember(provider);
      for (const other of boxes) {
        if (other !== box && other.isConnected && other.dataset.provider === provider) load(other);
      }
    }
    load(box).focus();
  });
}

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-embed-reset]')) {
  const status = button.parentElement?.querySelector('[role=status]');
  const show = () => {
    const providers = remembered();
    button.disabled = providers.length === 0;
    if (status) {
      status.textContent = providers.length ? `Gemerkt: ${providers.join(', ')}` : 'Derzeit ist nichts gemerkt.';
    }
  };

  button.hidden = false;
  show();
  button.addEventListener('click', () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    show();
  });
}
