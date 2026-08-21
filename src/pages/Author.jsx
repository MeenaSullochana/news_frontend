import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { authorService } from '../services/articleService';
import NewsCard from '../components/NewsCard';
import NewsImage from '../components/NewsImage';
import Loading, { SkeletonCard } from '../components/Loading';

const Author = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authorService
      .getBySlug(slug)
      .then(({ data }) => setData(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loading />;
  if (!data?.author) {
    return (
      <div className="container-news py-16 text-center">
        <h1 className="text-2xl font-bold">Author not found</h1>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const { author, articles } = data;

  return (
    <>
      <Helmet>
        <title>{author.name} - The Great India News</title>
        <meta name="description" content={author.bio} />
      </Helmet>

      <div className="container-news py-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
          <NewsImage
            src={author.profileImage}
            seed={author.slug}
            alt={author.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold font-headline">{author.name}</h1>
            <p className="text-brand-600 font-medium">{author.designation}</p>
            {author.bio && <p className="text-gray-600 mt-2 max-w-xl">{author.bio}</p>}
            <div className="flex gap-3 mt-3 justify-center sm:justify-start">
              {author.socialLinks?.twitter && (
                <a href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">Twitter</a>
              )}
              {author.socialLinks?.facebook && (
                <a href={author.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">Facebook</a>
              )}
            </div>
          </div>
        </div>

        <h2 className="section-title">Articles by {author.name}</h2>
        {articles?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <NewsCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No articles yet.</p>
        )}
      </div>
    </>
  );
};

export default Author;
