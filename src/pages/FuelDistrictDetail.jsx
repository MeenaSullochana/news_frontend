import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { featureService } from '../services/articleService';
import { FeatureIcon } from '../features/FeatureIcons';

const FuelDistrictDetail = () => {
  const { district } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    featureService
      .getFuelLive({ district })
      .then(({ data: res }) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [district]);

  const title = data?.district || data?.city || district;

  return (
    <div className="min-h-[50vh]">
      <Helmet>
        <title>{title} Fuel Prices | The Great India News</title>
      </Helmet>

      <div className="container-news py-6 sm:py-8">
        <Link to="/explore/fuel" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
          ← All Tamil Nadu Districts
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <FeatureIcon name="fuel" className="w-7 h-7 text-orange-600" />
          <h1 className="text-2xl font-headline font-bold text-slate-900">{title}</h1>
        </div>

        <div className="max-w-sm hub-card p-5 mt-6">
          {loading ? (
            <div className="h-20 skeleton rounded-xl" />
          ) : data ? (
            <>
              <p className="text-sm text-slate-600">
                Petrol <span className="text-2xl font-extrabold text-slate-900 ml-2">₹{data.petrol}</span>
              </p>
              <p className="text-sm text-slate-600 mt-3">
                Diesel <span className="text-2xl font-extrabold text-slate-900 ml-2">₹{data.diesel}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-4">Tamil Nadu · per litre</p>
              {data.source && <p className="text-[10px] text-slate-400 mt-2">Live via {data.source}</p>}
            </>
          ) : (
            <p className="text-sm text-rose-600">Could not load fuel prices.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FuelDistrictDetail;
