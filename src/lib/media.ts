/*
  Temporary media helpers.

  Media has not been migrated yet: content entries record legacy repo-relative paths
  (e.g. `images/Kachie.webp`) and the exact URLs the Webflow export referenced. The few
  local legacy files the homepage needs are staged under /public with the SAME relative
  path, so a legacy path maps straight to a URL. Anything not staged simply 404s until
  the deliberate media migration happens.
*/

export interface LegacyVideo {
  sources: string[];
  poster?: string;
  localFiles?: string[];
  caption?: string;
}

/** Turn a legacy path (`images/x.webp`) or absolute URL into something a browser can load. */
export function assetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return '/' + path.split('/').map(encodeURIComponent).join('/');
}

/** Prefer a locally held poster image; otherwise fall back to the poster URL the legacy site used. */
export function posterUrl(video: LegacyVideo): string | undefined {
  const local = video.localFiles?.find((f) => /\.(jpe?g|png|webp|avif)$/i.test(f));
  if (local) return assetUrl(local);
  return video.poster ? assetUrl(video.poster) : undefined;
}

export function videoMime(src: string): string | undefined {
  if (/\.mp4(\?|$)/i.test(src)) return 'video/mp4';
  if (/\.webm(\?|$)/i.test(src)) return 'video/webm';
  return undefined;
}
