/**
 * Asset path helper for GitHub Pages compatibility
 * Uses Vite's BASE_URL to prefix paths correctly
 */
export function assetPath(path: string): string {
  // Vite provides BASE_URL from vite.config.ts base property
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Get exercise media path (GIF preview)
 */
export function exerciseMediaPath(filename: string): string {
  return assetPath(`/media/exercises/${filename}`);
}
