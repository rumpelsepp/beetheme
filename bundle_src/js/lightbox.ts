// Lightbox for the galleries rendered by layouts/_shortcodes/gallery.html:
// a click on a picture shows it large in a modal <dialog>, with buttons,
// arrow keys and swipes to page through the gallery, and a link to the
// original where the picture carries one (a.image-original). The dialog
// brings the focus trap, Esc to close and the backdrop along.
//
// Only galleries marked data-lightbox take part (lightbox=true on the
// shortcode); in the others a click simply follows the link to the large
// image.

const GALLERY = '.gallery[data-lightbox]';

interface Picture {
  src: string;
  alt: string;
  original: string | undefined;
  link: HTMLAnchorElement;
}

function button(className: string, label: string, icon: string): HTMLButtonElement {
  const node = document.createElement('button');
  node.type = 'button';
  node.className = className;
  node.setAttribute('aria-label', label);
  const glyph = document.createElement('i');
  glyph.className = `bi ${icon}`;
  glyph.setAttribute('aria-hidden', 'true');
  node.append(glyph);
  return node;
}

class Lightbox {
  private readonly dialog = document.createElement('dialog');
  private readonly image = document.createElement('img');
  private readonly count = document.createElement('p');
  private readonly original = document.createElement('a');
  private readonly prev = button('lightbox-nav lightbox-prev', 'Vorheriges Bild', 'bi-chevron-left');
  private readonly next = button('lightbox-nav lightbox-next', 'Nächstes Bild', 'bi-chevron-right');
  private pictures: Picture[] = [];
  private index = 0;
  private touchX: number | null = null;

  constructor() {
    const close = button('lightbox-close', 'Schließen', 'bi-x-lg');
    this.dialog.className = 'lightbox';
    this.dialog.setAttribute('aria-label', 'Bildansicht');
    this.image.className = 'lightbox-image';
    this.count.className = 'lightbox-count';
    this.count.setAttribute('aria-live', 'polite');
    this.original.className = 'lightbox-original';
    this.original.textContent = 'Original';
    const footer = document.createElement('div');
    footer.className = 'lightbox-footer';
    footer.append(this.count, this.original);
    this.dialog.append(close, this.prev, this.image, this.next, footer);
    document.body.append(this.dialog);

    close.addEventListener('click', () => this.dialog.close());
    this.prev.addEventListener('click', () => this.step(-1));
    this.next.addEventListener('click', () => this.step(1));
    // A click beside the picture lands on the dialog itself.
    this.dialog.addEventListener('click', (event) => {
      if (event.target === this.dialog) {
        this.dialog.close();
      }
    });
    this.dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        this.step(-1);
      } else if (event.key === 'ArrowRight') {
        this.step(1);
      }
    });
    this.dialog.addEventListener('touchstart', (event) => {
      this.touchX = event.changedTouches[0]?.clientX ?? null;
    }, { passive: true });
    this.dialog.addEventListener('touchend', (event) => {
      const end = event.changedTouches[0]?.clientX;
      if (this.touchX !== null && end !== undefined && Math.abs(end - this.touchX) > 50) {
        this.step(end < this.touchX ? 1 : -1);
      }
      this.touchX = null;
    });
    // Back to the picture that was last shown, not the one clicked.
    this.dialog.addEventListener('close', () => this.pictures[this.index]?.link.focus());
  }

  open(pictures: Picture[], index: number): void {
    this.pictures = pictures;
    this.show(index);
    this.dialog.showModal();
  }

  private step(by: number): void {
    const n = this.pictures.length;
    this.show((this.index + by + n) % n);
  }

  private show(index: number): void {
    const picture = this.pictures[index];
    if (!picture) {
      return;
    }
    this.index = index;
    this.image.src = picture.src;
    this.image.alt = picture.alt;
    this.count.textContent = `Bild ${index + 1} von ${this.pictures.length}`;
    this.original.hidden = !picture.original;
    this.original.href = picture.original ?? '';
    const single = this.pictures.length < 2;
    this.prev.hidden = single;
    this.next.hidden = single;
  }
}

let lightbox: Lightbox | undefined;

for (const gallery of document.querySelectorAll(GALLERY)) {
  const links = Array.from(gallery.querySelectorAll<HTMLAnchorElement>('a.gallery-link'));
  const pictures = links.map((link) => ({
    src: link.href,
    alt: link.querySelector('img')?.alt ?? '',
    original: link.parentElement?.querySelector<HTMLAnchorElement>('a.image-original')?.href,
    link,
  }));

  links.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      // Leave "open in a new tab" and the like to the browser.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      lightbox ??= new Lightbox();
      lightbox.open(pictures, index);
    });
  });
}
