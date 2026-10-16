// The texts the theme's JS shows, in the language of the site: Hugo writes
// them into the page as JSON (layouts/_partials/head/js.html) from the
// theme's i18n/ files.

function read(): Record<string, string> {
  try {
    return JSON.parse(document.getElementById('theme-i18n')?.textContent ?? '{}') as Record<string, string>;
  } catch {
    return {};
  }
}

const texts = read();

// The text of `key`, with its {placeholders} replaced by `values`.
export function t(key: string, values: Record<string, string | number> = {}): string {
  const text = texts[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));
}
