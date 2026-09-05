import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { aeoService } from '../services/articleService';

const emptyPreview = {
  metaTitle: '',
  metaDescription: '',
  focusKeyword: '',
  secondaryKeywords: [],
  h1: '',
  headings: [],
  directAnswer: '',
  aiSummary: '',
  entities: [],
  faqs: [],
  ogTitle: '',
  ogDescription: '',
  canonicalSuggestion: '',
  internalLinks: [],
  customJsonLd: '',
  robots: 'index,follow',
  scorePreview: null,
};

/**
 * Shared Gemini generate + editable preview.
 * mode: 'page' | 'article'
 */
const GeminiGeneratePanel = ({
  mode = 'page',
  initialTopic = '',
  initialPath = '',
  pageType = 'custom',
  excerpt = '',
  content = '',
  articleId = null,
  onApplied,
  compact = false,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [path, setPath] = useState(initialPath);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [meta, setMeta] = useState(null);
  const [approved, setApproved] = useState(false);
  const inFlightRef = useRef(false);

  const geminiErrorMessage = (err) => {
    if (err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '')) {
      return 'Gemini took too long to respond. Wait a minute and try again.';
    }
    if (err?.response?.status === 429) {
      return err.response?.data?.message || 'Gemini API quota exceeded. Wait about 1 minute and try again.';
    }
    return err?.response?.data?.message || err?.message || 'Gemini generation failed';
  };

  const setField = (key, value) => {
    setPreview((p) => ({ ...p, [key]: value }));
    setApproved(false);
  };

  const csvJoin = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');
  const csvSplit = (v) =>
    String(v || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const runGenerate = async (regenerate = false) => {
    if (inFlightRef.current || loading) return;

    const t = (topic || initialTopic || '').trim();
    if (!t) {
      toast.error('Enter a topic or title first');
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setApproved(false);
    try {
      const { data } = await aeoService.generateGemini(
        {
          topic: t,
          path: path || initialPath,
          pageType,
          excerpt,
          content: content?.slice?.(0, 4000) || content,
          regenerate,
          targetType: mode,
          targetId: articleId || '',
        },
        { timeout: 125000 }
      );
      const previewData = { ...emptyPreview, ...data.data };
      setPreview(previewData);
      setMeta(data.meta);
      if (mode === 'article' && onApplied) {
        onApplied(previewData);
        toast.success(regenerate ? 'Regenerated and applied to article' : 'Generated and applied to article');
      } else {
        toast.success(regenerate ? 'Regenerated with Gemini' : 'Generated with Gemini');
      }
    } catch (err) {
      toast.error(geminiErrorMessage(err));
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  const copyAll = async () => {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(preview, null, 2));
      toast.success('Copied JSON to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  const handleApproveSave = async () => {
    if (!preview) return;
    if (!approved) {
      setApproved(true);
      toast.success('Marked as approved — click Save again to persist');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'article') {
        if (onApplied) {
          onApplied(preview);
          toast.success('Applied to article form — remember to Save the article');
        } else if (articleId) {
          await aeoService.applyGeminiArticle({ articleId, ...preview });
          toast.success('Saved to article');
          onApplied?.(preview);
        } else {
          onApplied?.(preview);
          toast.success('Applied to form');
        }
      } else {
        await aeoService.applyGeminiPage({
          ...preview,
          path: path || preview.canonicalSuggestion || initialPath,
          pageType,
          title: preview.h1 || topic,
          saveFaqs: true,
          saveEntities: true,
        });
        toast.success('Approved & saved to AEO page + FAQs/entities');
        onApplied?.(preview);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
      setApproved(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className={`rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 text-base sm:text-lg">
              ஜெமினி மூலம் உருவாக்கு / Generate with Gemini
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              SEO · AEO answers · GEO summaries · FAQs · entities · JSON-LD · Open Graph
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => runGenerate(false)}
            className="btn-primary text-sm py-2.5 px-4 shrink-0 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generating…
              </span>
            ) : (
              '✨ Generate with Gemini'
            )}
          </button>
        </div>

        <div className={`grid gap-3 ${mode === 'page' ? 'sm:grid-cols-2' : ''}`}>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Topic / Title</label>
            <input
              className="admin-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Chennai metro expansion / சென்னை மெட்ரோ"
            />
          </div>
          {mode === 'page' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Page path</label>
              <input
                className="admin-input"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/about or /news/slug"
              />
            </div>
          )}
        </div>

        {meta && (
          <p className="text-[11px] text-slate-400 mt-2">
            Model {meta.model} · {meta.latencyMs}ms · tokens {meta.usage?.totalTokens ?? '—'}
          </p>
        )}
      </div>

      {loading && !preview && (
        <div className="admin-card animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-20 bg-slate-100 rounded" />
          <div className="h-20 bg-slate-100 rounded" />
        </div>
      )}

      {preview && (
        <div className="admin-card space-y-4 border-teal-100">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900">Editable preview</h4>
              {preview.scorePreview?.score != null && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                  Score {preview.scorePreview.score}
                </span>
              )}
              {approved && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Approved
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary text-xs py-1.5 px-3" disabled={loading} onClick={() => runGenerate(true)}>
                Regenerate
              </button>
              <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={copyAll}>
                Copy
              </button>
              <button type="button" className="btn-primary text-xs py-1.5 px-3" disabled={saving} onClick={handleApproveSave}>
                {saving ? 'Saving…' : approved ? 'Save' : 'Approve'}
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="SEO title">
              <input className="admin-input" value={preview.metaTitle} onChange={(e) => setField('metaTitle', e.target.value)} />
            </Field>
            <Field label="Focus keyword">
              <input className="admin-input" value={preview.focusKeyword} onChange={(e) => setField('focusKeyword', e.target.value)} />
            </Field>
          </div>
          <Field label="Meta description">
            <textarea className="admin-input" rows={2} value={preview.metaDescription} onChange={(e) => setField('metaDescription', e.target.value)} />
          </Field>
          <Field label="Direct answer (AEO)">
            <textarea className="admin-input" rows={2} value={preview.directAnswer} onChange={(e) => setField('directAnswer', e.target.value)} />
          </Field>
          <Field label="AI summary (GEO)">
            <textarea className="admin-input" rows={3} value={preview.aiSummary} onChange={(e) => setField('aiSummary', e.target.value)} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="H1">
              <input className="admin-input" value={preview.h1} onChange={(e) => setField('h1', e.target.value)} />
            </Field>
            <Field label="Secondary keywords">
              <input
                className="admin-input"
                value={csvJoin(preview.secondaryKeywords)}
                onChange={(e) => setField('secondaryKeywords', csvSplit(e.target.value))}
              />
            </Field>
            <Field label="Entities">
              <input
                className="admin-input"
                value={csvJoin(preview.entities)}
                onChange={(e) => setField('entities', csvSplit(e.target.value))}
              />
            </Field>
            <Field label="Headings">
              <input
                className="admin-input"
                value={csvJoin(preview.headings)}
                onChange={(e) => setField('headings', csvSplit(e.target.value))}
              />
            </Field>
            <Field label="OG title">
              <input className="admin-input" value={preview.ogTitle} onChange={(e) => setField('ogTitle', e.target.value)} />
            </Field>
            <Field label="Canonical suggestion">
              <input className="admin-input" value={preview.canonicalSuggestion} onChange={(e) => setField('canonicalSuggestion', e.target.value)} />
            </Field>
          </div>
          <Field label="OG description">
            <textarea className="admin-input" rows={2} value={preview.ogDescription} onChange={(e) => setField('ogDescription', e.target.value)} />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">FAQs</label>
              <button
                type="button"
                className="text-xs text-teal-700"
                onClick={() => setField('faqs', [...(preview.faqs || []), { question: '', answer: '' }])}
              >
                + Add
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {(preview.faqs || []).map((f, i) => (
                <div key={i} className="rounded-lg border border-slate-100 p-2 space-y-1 bg-slate-50/80">
                  <input
                    className="admin-input text-sm"
                    placeholder="Question"
                    value={f.question}
                    onChange={(e) => {
                      const faqs = [...preview.faqs];
                      faqs[i] = { ...faqs[i], question: e.target.value };
                      setField('faqs', faqs);
                    }}
                  />
                  <textarea
                    className="admin-input text-sm"
                    rows={2}
                    placeholder="Answer"
                    value={f.answer}
                    onChange={(e) => {
                      const faqs = [...preview.faqs];
                      faqs[i] = { ...faqs[i], answer: e.target.value };
                      setField('faqs', faqs);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <Field label="Internal links (label|url per line)">
            <textarea
              className="admin-input font-mono text-xs"
              rows={2}
              value={(preview.internalLinks || []).map((l) => `${l.label}|${l.url}`).join('\n')}
              onChange={(e) =>
                setField(
                  'internalLinks',
                  e.target.value
                    .split('\n')
                    .map((line) => {
                      const [label, url] = line.split('|').map((s) => s.trim());
                      return { label: label || url, url };
                    })
                    .filter((l) => l.url)
                )
              }
            />
          </Field>

          <Field label="JSON-LD">
            <textarea
              className="admin-input font-mono text-xs"
              rows={6}
              value={preview.customJsonLd || ''}
              onChange={(e) => setField('customJsonLd', e.target.value)}
            />
          </Field>

          {preview.scorePreview?.suggestions?.length > 0 && (
            <ul className="text-xs text-slate-500 space-y-1 bg-slate-50 rounded-xl p-3">
              {preview.scorePreview.suggestions.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    {children}
  </div>
);

export default GeminiGeneratePanel;
