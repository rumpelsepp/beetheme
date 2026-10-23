// What a <details> of the main navigation (layouts/_partials/nav.html)
// doesn't bring along by itself, to behave like a dropdown: it closes on a
// click outside of it and on Esc, which hands the focus back to its
// <summary>. Without this script it closes only through its <summary>.

const OPEN = '.site-nav-sub[open]';

function close(details: HTMLDetailsElement, refocus: boolean): void {
  details.open = false;
  if (refocus) details.querySelector('summary')?.focus();
}

document.addEventListener('click', (event) => {
  for (const details of document.querySelectorAll<HTMLDetailsElement>(OPEN)) {
    if (!details.contains(event.target as Node)) close(details, false);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const details = (event.target as Element | null)?.closest<HTMLDetailsElement>(OPEN);
  if (details) {
    // Esc closes the innermost dropdown only, not the popover around it.
    event.preventDefault();
    close(details, true);
  }
});
