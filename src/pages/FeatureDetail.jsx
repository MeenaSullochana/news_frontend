import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { featureService } from '../services/articleService';
import { FeatureModule } from '../features/FeatureWidgets';
import { StatusPill } from '../features/FeatureIcons';
import NewsImage from '../components/NewsImage';

const FeatureDetail = () => {
  const { key } = useParams();

  if (key === 'matrimony' || key === 'events') {
    return <Navigate to="/matrimony" replace />;
  }
  if (key === 'weather') {
    return <Navigate to="/explore/weather" replace />;
  }
  if (key === 'gold_price') {
    return <Navigate to="/explore/gold" replace />;
  }
  if (key === 'fuel_price') {
    return <Navigate to="/explore/fuel" replace />;
  }
  if (key === 'jobs' || key === 'government_notifications') {
    return <Navigate to="/government-notifications" replace />;
  }
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    setQuizIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    featureService
      .getByKey(key)
      .then(({ data }) => setFeature(data.data))
      .catch(() => setFeature(null))
      .finally(() => setLoading(false));
  }, [key]);

  if (loading) {
    return (
      <div className="container-news py-12">
        <div className="h-40 rounded-2xl skeleton" />
      </div>
    );
  }

  if (!feature) {
    return (
      <div className="container-news py-12 text-center">
        <h1 className="text-xl font-bold text-slate-900">Feature not found</h1>
        <Link to="/explore" className="text-brand-700 text-sm mt-3 inline-block font-semibold">
          ← Back to Explore
        </Link>
      </div>
    );
  }

  const quizQuestions = (feature.items || []).filter((i) => i.itemType === 'quiz_question');
  const listItems = (feature.items || []).filter((i) => i.itemType !== 'quiz_question');

  const answerQuiz = (optIndex) => {
    if (selected != null || done) return;
    setSelected(optIndex);
    const q = quizQuestions[quizIndex];
    if (optIndex === q.meta?.answerIndex) setScore((s) => s + 1);
    setTimeout(() => {
      if (quizIndex + 1 >= quizQuestions.length) {
        setDone(true);
      } else {
        setQuizIndex((i) => i + 1);
        setSelected(null);
      }
    }, 700);
  };

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>{feature.name} | The Great India News</title>
      </Helmet>

      <div className="border-b border-stone-200/80 bg-white/60">
        <div className="container-news py-6 sm:py-8">
          <Link to="/explore" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
            ← Explore All Features
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900">{feature.name}</h1>
            <StatusPill status={feature.status} />
          </div>
          {feature.nameTamil && <p className="text-sm text-slate-600 font-tamil mt-1">{feature.nameTamil}</p>}
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">{feature.description}</p>
        </div>
      </div>

      <div className="container-news py-6 space-y-6">
        {['weather', 'gold_price', 'currency', 'market', 'fuel_price', 'traffic'].includes(feature.key) && (
          <div className={['weather', 'gold_price'].includes(feature.key) ? 'max-w-md' : 'max-w-sm'}>
            <FeatureModule feature={{ ...feature, items: [] }} detail={['weather', 'gold_price'].includes(feature.key)} />
          </div>
        )}

        {feature.key === 'news_quiz' && quizQuestions.length > 0 && (
          <div className="max-w-xl hub-card p-6">
            {done ? (
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900">Quiz complete</p>
                <p className="text-slate-600 mt-2">
                  You scored {score} / {quizQuestions.length}
                </p>
                <button
                  type="button"
                  className="btn-primary mt-4"
                  onClick={() => {
                    setDone(false);
                    setQuizIndex(0);
                    setSelected(null);
                    setScore(0);
                  }}
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600 mb-2">
                  Question {quizIndex + 1} of {quizQuestions.length}
                </p>
                <h2 className="text-lg font-bold text-slate-900 mb-4">{quizQuestions[quizIndex].title}</h2>
                <div className="space-y-2">
                  {(quizQuestions[quizIndex].meta?.options || []).map((opt, i) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => answerQuiz(i)}
                      className={`w-full text-left px-4 py-3 rounded-2xl border text-sm font-medium transition-colors ${
                        selected === i
                          ? i === quizQuestions[quizIndex].meta?.answerIndex
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-rose-300 bg-rose-50'
                          : 'border-stone-200 hover:border-brand-400 bg-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {listItems.length > 0 && (
          <div className="hub-card divide-y divide-stone-200">
            {listItems.map((item) => (
              <div key={item._id} className="p-4 sm:p-5 flex gap-4">
                {item.image && (
                  <NewsImage src={item.image} seed={item._id} alt="" className="w-20 h-16 rounded-xl object-cover shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{item.titleTamil || item.title}</p>
                  {item.subtitle && <p className="text-sm text-slate-600">{item.subtitle}</p>}
                  {item.description && <p className="text-sm text-slate-600 mt-1">{item.description}</p>}
                  {item.meta && (
                    <p className="text-xs text-slate-500 mt-1">
                      {Object.entries(item.meta)
                        .filter(([k]) => !['options', 'answerIndex'].includes(k))
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!listItems.length && feature.key !== 'news_quiz' && !['weather', 'gold_price', 'currency', 'market', 'fuel_price', 'traffic'].includes(feature.key) && (
          <p className="text-sm text-slate-600">No items yet. Add content from Admin → Feature Content.</p>
        )}
      </div>
    </div>
  );
};

export default FeatureDetail;
