// Icons of Bootstrap Icons for the DOM the scripts build, the same as
// layouts/_partials/icon.html writes them. The SVG comes straight from the
// npm package, as text (build.mjs loads .svg files that way):
//
//   import playFill from 'bootstrap-icons/icons/play-fill.svg';
//   button.append(icon(playFill));
//   button.innerHTML = `${iconHTML(playFill)} Anhören`;
//
// The icon is 1em large, takes the text colour and is hidden from screen
// readers -- the text or the aria-label of what it stands in says it.

// The SVG as markup.
export function iconHTML(svg: string): string {
  return svg
    .trim()
    .replace(/\s(width|height)="[^"]*"/g, '')
    .replace('<svg', '<svg width="1em" height="1em" aria-hidden="true" focusable="false"');
}

// The SVG as an element.
export function icon(svg: string): SVGSVGElement {
  const template = document.createElement('template');
  template.innerHTML = iconHTML(svg);
  return template.content.firstElementChild as SVGSVGElement;
}
