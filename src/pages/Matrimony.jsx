import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { matrimonyService } from '../services/articleService';
import { useAuth } from '../context/AuthContext';
import NewsImage from '../components/NewsImage';

const ProfileCard = ({ p }) => (
  <article className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
    <div className="relative">
      <NewsImage
        src={p.profilePhoto}
        seed={p._id}
        alt={p.fullName}
        className="w-full h-48 object-cover"
      />
      {p.isVerified && (
        <span className="absolute top-2 right-2 text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-md">
          Verified
        </span>
      )}
      {p.isFeatured && (
        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase bg-teal-700 text-white px-2 py-0.5 rounded-md">
          Featured
        </span>
      )}
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{p.profileId}</p>
      <h2 className="font-semibold text-slate-900 mt-0.5">{p.fullName}</h2>
      <p className="text-xs text-slate-500 mt-1">
        {[p.age ? `${p.age} yrs` : null, p.height, p.religion, p.caste].filter(Boolean).join(' · ')}
      </p>
      <p className="text-xs text-slate-600 mt-2 line-clamp-2">
        {[p.education, p.profession, p.currentLocation || p.city].filter(Boolean).join(' · ')}
      </p>
      {(p.rasi || p.nakshatra) && (
        <p className="text-[11px] text-slate-400 mt-1">
          {[p.rasi, p.nakshatra].filter(Boolean).join(' / ')}
        </p>
      )}
      <Link
        to={`/matrimony/${p.profileId || p._id}`}
        className="mt-auto pt-4 text-sm font-semibold text-brand-700 hover:underline"
      >
        View Profile →
      </Link>
    </div>
  </article>
);

const Matrimony = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('Matrimony Profiles');
  const [titleTa, setTitleTa] = useState('திருமண சுயவிவரங்கள்');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [religion, setReligion] = useState(searchParams.get('religion') || '');
  const [caste, setCaste] = useState(searchParams.get('caste') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');
  const [featured, setFeatured] = useState(searchParams.get('featured') === '1');
  const [verified, setVerified] = useState(searchParams.get('verified') === '1');
  const [ageMin, setAgeMin] = useState(searchParams.get('ageMin') || '');
  const [ageMax, setAgeMax] = useState(searchParams.get('ageMax') || '');

  useEffect(() => {
    const next = new URLSearchParams();
    if (search) next.set('q', search);
    if (page > 1) next.set('page', String(page));
    if (gender) next.set('gender', gender);
    if (religion) next.set('religion', religion);
    if (caste) next.set('caste', caste);
    if (city) next.set('city', city);
    if (sort && sort !== 'featured') next.set('sort', sort);
    if (featured) next.set('featured', '1');
    if (verified) next.set('verified', '1');
    if (ageMin) next.set('ageMin', ageMin);
    if (ageMax) next.set('ageMax', ageMax);
    setSearchParams(next, { replace: true });
  }, [search, page, gender, religion, caste, city, sort, featured, verified, ageMin, ageMax]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    matrimonyService
      .getPublic({
        page,
        limit: 18,
        q: search || undefined,
        gender: gender || undefined,
        religion: religion || undefined,
        caste: caste || undefined,
        city: city || undefined,
        sort,
        featured: featured ? '1' : undefined,
        verified: verified ? '1' : undefined,
        ageMin: ageMin || undefined,
        ageMax: ageMax || undefined,
      })
      .then(({ data }) => {
        setItems(data.data || []);
        setTitle(data.title || 'Matrimony Profiles');
        setTitleTa(data.titleTa || 'திருமண சுயவிவரங்கள்');
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page, search, gender, religion, caste, city, sort, featured, verified, ageMin, ageMax]);

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(q.trim());
  };

  const resetFilters = () => {
    setGender('');
    setReligion('');
    setCaste('');
    setCity('');
    setAgeMin('');
    setAgeMax('');
    setFeatured(false);
    setVerified(false);
    setSort('featured');
    setPage(1);
  };

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>{titleTa || title} | The Great India News</title>
        <meta name="description" content="Browse approved matrimony profiles — education, profession, religion and more." />
      </Helmet>

      <div className="border-b border-stone-200 bg-white/70">
        <div className="container-news py-8">
          <Link to="/" className="text-xs font-semibold text-brand-700 hover:underline">← முகப்பு</Link>
          <p className="text-[11px] font-bold uppercase tracking-widest text-teal-700 mt-3">Matrimony</p>
          <h1 className="text-3xl font-headline font-bold text-slate-900 mt-1">{titleTa || title}</h1>
          {title && titleTa && title !== titleTa && (
            <p className="text-sm text-slate-500 mt-1">{title}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {user?.role === 'MATRIMONY' ? (
              <Link to="/matrimony/member" className="btn-primary text-sm py-2 px-4">
                My Profile
              </Link>
            ) : (
              <>
                <Link to="/matrimony/login" className="btn-secondary text-sm py-2 px-4">
                  Login
                </Link>
                <Link to="/matrimony/register" className="btn-primary text-sm py-2 px-4">
                  Register
                </Link>
              </>
            )}
          </div>

          <form onSubmit={applySearch} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, ID, education, city…"
              className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white"
            />
            <button type="submit" className="btn-primary text-sm shrink-0">Search</button>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="btn-secondary text-sm shrink-0"
            >
              Filters
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setFeatured(false); setVerified(false); setSort('featured'); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${!featured && !verified ? 'bg-slate-900 text-white' : 'bg-white border border-stone-200 text-slate-600'}`}
            >
              Latest / All
            </button>
            <button
              type="button"
              onClick={() => { setFeatured(true); setVerified(false); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${featured ? 'bg-slate-900 text-white' : 'bg-white border border-stone-200 text-slate-600'}`}
            >
              Featured
            </button>
            <button
              type="button"
              onClick={() => { setVerified(true); setFeatured(false); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${verified ? 'bg-slate-900 text-white' : 'bg-white border border-stone-200 text-slate-600'}`}
            >
              Verified
            </button>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="border border-stone-200 rounded-lg px-3 py-1.5 text-xs bg-white"
            >
              <option value="featured">Sort: Featured first</option>
              <option value="latest">Sort: Latest</option>
              <option value="age_asc">Sort: Age ↑</option>
              <option value="age_desc">Sort: Age ↓</option>
            </select>
          </div>

          {showFilters && (
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl border border-stone-200 bg-white">
              <select value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }} className="border border-stone-200 rounded-xl px-3 py-2 text-sm">
                <option value="">All genders</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
              <input value={religion} onChange={(e) => setReligion(e.target.value)} onBlur={() => setPage(1)} placeholder="Religion" className="border border-stone-200 rounded-xl px-3 py-2 text-sm" />
              <input value={caste} onChange={(e) => setCaste(e.target.value)} onBlur={() => setPage(1)} placeholder="Caste" className="border border-stone-200 rounded-xl px-3 py-2 text-sm" />
              <input value={city} onChange={(e) => setCity(e.target.value)} onBlur={() => setPage(1)} placeholder="City / location" className="border border-stone-200 rounded-xl px-3 py-2 text-sm" />
              <input type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)} placeholder="Age min" className="border border-stone-200 rounded-xl px-3 py-2 text-sm" />
              <input type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)} placeholder="Age max" className="border border-stone-200 rounded-xl px-3 py-2 text-sm" />
              <button type="button" onClick={resetFilters} className="btn-secondary text-sm sm:col-span-2">Reset filters</button>
            </div>
          )}
        </div>
      </div>

      <div className="container-news py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-80 rounded-2xl" />
            ))}
          </div>
        ) : !items.length ? (
          <div className="text-center py-16 text-slate-500">
            <p className="font-medium text-slate-700">No profiles match your search.</p>
            <button type="button" onClick={resetFilters} className="text-brand-700 font-semibold mt-3">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4">{pagination.total} profiles</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((p) => (
                <ProfileCard key={p._id} p={p} />
              ))}
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {pagination.page} / {pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary text-sm disabled:opacity-40"
                >
                  Load More / Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Matrimony;
