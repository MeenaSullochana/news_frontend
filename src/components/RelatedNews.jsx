import NewsCard from './NewsCard';

const RelatedNews = ({ articles }) => {
  if (!articles?.length) return null;

  return (
    <section className="mt-8">
      <h3 className="section-title">தொடர்புடைய செய்திகள்</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <NewsCard key={article._id} article={article} />
        ))}
      </div>
    </section>
  );
};

export default RelatedNews;
