/** Extract YouTube video ID from common URL formats. */
export const getYoutubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v');
      }
      const embedMatch = parsed.pathname.match(/^\/embed\/([^/?]+)/);
      if (embedMatch) return embedMatch[1];
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch {
    return null;
  }

  return null;
};

export const getYoutubeEmbedUrl = (url) => {
  const id = getYoutubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
};
