import { useEffect, useState } from 'react';
import { articleService } from '../services/articleService';
import FeaturedNews from '../components/FeaturedNews';
import { LatestNews, PopularNews } from '../components/LatestNews';
import CategorySection from '../components/CategorySection';
import DistrictNews from '../components/DistrictNews';
import Advertisement from '../components/Advertisement';
import AdSenseSlot from '../components/AdSenseSlot';
import NewsCard from '../components/NewsCard';
import YoutubeVideoSlider from '../components/YoutubeVideoSlider';
import MustWatchSection from '../components/MustWatchSection';
import InstagramPostsSection from '../components/InstagramPostsSection';
import GoogleNewsSection from '../components/GoogleNewsSection';
import TravelUpdatesSection from '../components/TravelUpdatesSection';
import SportsWidgets from '../components/SportsWidgets';
import GovernmentNotificationsSection from '../components/GovernmentNotificationsSection';
import { SkeletonCard } from '../components/Loading';
import { CATEGORY_SLUGS } from '../utils/helpers';
import { Helmet } from 'react-helmet-async';

const CATEGORY_TITLES = {
  'tamil-nadu': 'தமிழ்நாடு',
  chennai: 'சென்னை',
  india: 'இந்தியா',
  world: 'உலகம்',
  politics: 'அரசியல்',
  business: 'வணிகம்',
  sports: 'விளையாட்டு',
  cinema: 'சினிமா',
  technology: 'தொழில்நுட்பம்',
  education: 'கல்வி',
  jobs: 'வேலைவாய்ப்பு',
  spiritual: 'ஆன்மிகம்',
  special: 'சிறப்பு',
};

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, latestRes, popularRes] = await Promise.all([
          articleService.getFeatured(),
          articleService.getLatest(8),
          articleService.getPopular(5),
        ]);

        setFeatured(featuredRes.data.data || []);
        setLatest(latestRes.data.data || []);
        setPopular(popularRes.data.data || []);

        const catResults = {};
        await Promise.all(
          CATEGORY_SLUGS.map(async (slug) => {
            try {
              const { data } = await articleService.getByCategory(slug, 1, 5);
              catResults[slug] = data.data || [];
            } catch {
              catResults[slug] = [];
            }
          })
        );
        setCategoryData(catResults);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroArticle = featured[0];

  return (
    <>
      <Helmet>
        <title>The Great India News - Latest Tamil News</title>
        <meta name="description" content="Latest Tamil news from Tamil Nadu, India and World. Breaking news, politics, sports, cinema and more." />
      </Helmet>

      <div className="container-news py-6">
        <Advertisement position="homepage_top" className="mb-6" />
        <AdSenseSlot location="homepage" page="home" className="mb-6" />
        <AdSenseSlot location="homepage_top" page="home" className="mb-6" />

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 skeleton h-96 rounded-xl" />
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              {heroArticle ? (
                <FeaturedNews article={heroArticle} />
              ) : latest[0] ? (
                <FeaturedNews article={latest[0]} />
              ) : null}
            </div>
            <div className="space-y-6">
              <LatestNews articles={latest.slice(0, 6)} />
              <PopularNews articles={popular} />
            </div>
          </div>
        )}

        {!loading && featured.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {featured.slice(1, 5).map((article) => (
              <NewsCard key={article._id} article={article} />
            ))}
          </div>
        )}

        <Advertisement position="homepage_middle" className="mb-8" />
        <AdSenseSlot location="homepage_middle" page="home" className="mb-8" />

        <MustWatchSection />

        <YoutubeVideoSlider />

        <InstagramPostsSection />

        <GoogleNewsSection />

        <TravelUpdatesSection />

        <SportsWidgets page="homepage" />

        <GovernmentNotificationsSection />

        <DistrictNews />

        {CATEGORY_SLUGS.map((slug) => (
          <CategorySection
            key={slug}
            title={CATEGORY_TITLES[slug]}
            slug={slug}
            articles={categoryData[slug]}
            loading={loading}
          />
        ))}
      </div>
    </>
  );
};

export default Home;
