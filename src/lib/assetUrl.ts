// public/ assets referenced by an absolute string literal (e.g. "/images/x.svg")
// aren't rewritten by Vite's base-path handling the way index.html or
// imported assets are, so a hardcoded "/images/..." breaks once the app is
// deployed under a subpath (e.g. GitHub Pages' "/analisis-butir-soal/").
// This resolves the path against the actual deployed base URL instead.
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
