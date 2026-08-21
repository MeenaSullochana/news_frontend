import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/articleService';
import NewsCard from './NewsCard';

const DistrictNews = () => {
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    categoryService
      .getAll({ districts: 'true' })
      .then(({ data }) => setDistricts(data.data || []))
      .catch(() => {});
  }, []);

  if (!districts.length) return null;

  return (
    <section className="mb-10">
      <h2 className="section-title">மாவட்ட செய்திகள்</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {districts.map((district) => (
          <Link
            key={district._id}
            to={`/tamil-nadu/${district.slug}`}
            className="block p-3 text-center bg-gray-50 hover:bg-brand-50 hover:text-brand-600 rounded-lg border border-gray-100 transition-colors"
          >
            <span className="text-sm font-medium">{district.nameTamil || district.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default DistrictNews;
