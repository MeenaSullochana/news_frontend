const decodeHtmlEntities = (s = '') =>
  String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

const stripHtmlBlocks = (html = '') =>
  String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

const JUNK_PATTERNS = [
  /function\s+\w+\s*\(/,
  /"@context"\s*:/,
  /document\.querySelector/,
  /\{\s*display\s*:/,
  /@media\s*\(/,
];

export const isJunkGoogleNewsContent = (text = '') => {
  const t = String(text).trim();
  if (!t) return true;
  const hits = JUNK_PATTERNS.filter((re) => re.test(t)).length;
  return hits >= 2 || (hits >= 1 && t.length > 2000);
};

/** Strip HTML — plain text only */
export const stripHtml = (s = '') => {
  let t = stripHtmlBlocks(decodeHtmlEntities(String(s)))
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/[^\s]+\.(jpe?g|png|gif|webp)(\?[^\s]*)?/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t;
};

/** Full clean article text with paragraph breaks preserved */
export const cleanGoogleNewsContent = (text = '') => {
  let t = String(text || '').trim();
  if (!t) return '';

  if (t.includes('<') || t.includes('&lt;')) {
    const safe = stripHtmlBlocks(decodeHtmlEntities(t));
    const pMatches = safe.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    const paragraphs = pMatches
      .map((block) => stripHtml(block.replace(/<\/?p[^>]*>/gi, '')))
      .filter((p) => p.length >= 40 && !isJunkGoogleNewsContent(p));
    if (paragraphs.length >= 1) {
      t = paragraphs.join('\n\n');
    } else {
      t = stripHtml(t);
    }
  } else {
    t = decodeHtmlEntities(t);
  }

  t = t.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (isJunkGoogleNewsContent(t)) {
    const good = t.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length >= 40 && !isJunkGoogleNewsContent(p));
    t = good.join('\n\n');
  }
  return t;
};

/** Short excerpt for listing (~200 chars) */
export const truncateExcerpt = (text = '', maxLen = 200) => {
  const cleaned = cleanGoogleNewsContent(text);
  if (!cleaned) return '';
  const flat = cleaned.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  if (flat.length <= maxLen) return flat;
  const cut = flat.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLen * 0.55 ? cut.slice(0, lastSpace) : cut).trim()}…`;
};

export const getGoogleNewsExcerpt = (item = {}) => {
  if (item.excerpt && !isJunkGoogleNewsContent(item.excerpt)) {
    const ex = truncateExcerpt(item.excerpt);
    if (ex) return ex;
  }
  for (const c of [item.description, item.content]) {
    const ex = truncateExcerpt(c);
    if (ex) return ex;
  }
  return '';
};

/** Paragraphs for detail page */
export const toArticleParagraphs = (text = '') => {
  const cleaned = cleanGoogleNewsContent(text);
  if (!cleaned) return [];
  return cleaned.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
};
