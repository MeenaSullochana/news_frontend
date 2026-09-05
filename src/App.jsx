import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import Category from './pages/Category';
import DistrictPage from './pages/DistrictPage';
import Article from './pages/Article';
import Search from './pages/Search';
import Author from './pages/Author';
import Explore from './pages/Explore';
import FeatureDetail from './pages/FeatureDetail';
import WeatherDistricts from './pages/WeatherDistricts';
import WeatherDistrictDetail from './pages/WeatherDistrictDetail';
import PreciousMetalsPage from './pages/PreciousMetalsPage';
import FuelDistricts from './pages/FuelDistricts';
import FuelDistrictDetail from './pages/FuelDistrictDetail';
import Marketplace from './pages/Marketplace';
import MarketplaceDetail from './pages/MarketplaceDetail';
import GovernmentNotifications from './pages/GovernmentNotifications';
import GoogleNews from './pages/GoogleNews';
import LiveSports from './pages/LiveSports';
import MatchDetails from './pages/MatchDetails';
import PlayerDetails from './pages/PlayerDetails';
import TravelUpdates from './pages/TravelUpdates';
import Matrimony from './pages/Matrimony';
import MatrimonyDetail from './pages/MatrimonyDetail';
import About from './pages/About';
import {
  Contact, PrivacyPolicy, Terms,
  EditorialPolicy, CorrectionPolicy, Copyright, Grievance,
} from './pages/StaticPages';

import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import { AdminThemeProvider } from './context/AdminThemeContext';
import Dashboard from './admin/Dashboard';
import Articles from './admin/Articles';
import ArticleForm from './admin/ArticleForm';
import Categories from './admin/Categories';
import Authors from './admin/Authors';
import Media from './admin/Media';
import BreakingNewsAdmin from './admin/BreakingNewsAdmin';
import Advertisements from './admin/Advertisements';
import Users from './admin/Users';
import RolePermissions from './admin/RolePermissions';
import Settings from './admin/Settings';
import FeaturesAdmin from './admin/FeaturesAdmin';
import FeatureContentAdmin from './admin/FeatureContentAdmin';
import AdminMarketplace from './admin/AdminMarketplace';
import AeoGeo from './admin/AeoGeo';
import YoutubeSliderAdmin from './admin/YoutubeSliderAdmin';
import InstagramPostsAdmin from './admin/InstagramPostsAdmin';
import GoogleNewsAdmin from './admin/GoogleNewsAdmin';
import TravelNotificationsAdmin from './admin/TravelNotificationsAdmin';
import SportsLiveAdmin from './admin/SportsLiveAdmin';
import GovernmentNotificationsAdmin from './admin/GovernmentNotificationsAdmin';
import AdSenseAdmin from './admin/AdSenseAdmin';
import GoogleAnalyticsAdmin from './admin/GoogleAnalyticsAdmin';
import MatrimonyDashboard from './admin/matrimony/MatrimonyDashboard';
import MatrimonyProfileForm from './admin/matrimony/MatrimonyProfileForm';
import MatrimonyProfileList from './admin/matrimony/MatrimonyProfileList';
import MatrimonyProfileView from './admin/matrimony/MatrimonyProfileView';
import MatrimonyProfileEnquiries from './admin/matrimony/MatrimonyProfileEnquiries';
import MatrimonyCategories from './admin/matrimony/MatrimonyCategories';
import MatrimonySettings from './admin/matrimony/MatrimonySettings';
import PageMenuLayout from './admin/PageMenuLayout';
import AboutPageEditor from './admin/AboutPageEditor';

import SellerLayout from './seller/SellerLayout';
import SellerLogin from './seller/SellerLogin';
import SellerRegister from './seller/SellerRegister';
import SellerDashboard from './seller/SellerDashboard';
import SellerProducts from './seller/SellerProducts';
import SellerProductForm from './seller/SellerProductForm';
import SellerEnquiries from './seller/SellerEnquiries';

import MatrimonyLogin from './matrimony/MatrimonyLogin';
import MatrimonyRegister from './matrimony/MatrimonyRegister';
import MatrimonyLayout from './matrimony/MatrimonyLayout';
import MatrimonyMemberDashboard from './matrimony/MatrimonyDashboard';
import MatrimonyMemberProfileForm from './matrimony/MatrimonyMemberProfileForm';
import MatrimonyEnquiries from './matrimony/MatrimonyEnquiries';

const CATEGORY_ROUTES = [
  'tamil-nadu', 'chennai', 'india', 'world', 'politics', 'business',
  'sports', 'cinema', 'technology', 'education', 'jobs', 'spiritual', 'special',
];

function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="explore/weather/:district" element={<WeatherDistrictDetail />} />
        <Route path="explore/weather" element={<WeatherDistricts />} />
        <Route path="explore/gold" element={<PreciousMetalsPage />} />
        <Route path="explore/fuel/:district" element={<FuelDistrictDetail />} />
        <Route path="explore/fuel" element={<FuelDistricts />} />
        <Route path="explore/:key" element={<FeatureDetail />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="marketplace/:id" element={<MarketplaceDetail />} />
        <Route path="government-notifications" element={<GovernmentNotifications />} />
        <Route path="google-news" element={<GoogleNews />} />
        <Route path="live-sports" element={<LiveSports />} />
        <Route path="live-sports/match/:id/player/:playerKey" element={<PlayerDetails />} />
        <Route path="live-sports/match/:id" element={<MatchDetails />} />
        <Route path="travel-updates" element={<TravelUpdates />} />
        <Route path="matrimony" element={<Matrimony />} />
        <Route path="matrimony/:id" element={<MatrimonyDetail />} />
        {CATEGORY_ROUTES.map((slug) => (
          <Route key={slug} path={slug} element={<Category />} />
        ))}
        <Route path="tamil-nadu/:district" element={<DistrictPage />} />
        <Route path="news/:slug" element={<Article />} />
        <Route path="post/:slug" element={<Article />} />
        <Route path="author/:slug" element={<Author />} />
        <Route path="search" element={<Search />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="editorial-policy" element={<EditorialPolicy />} />
        <Route path="correction-policy" element={<CorrectionPolicy />} />
        <Route path="copyright" element={<Copyright />} />
        <Route path="grievance" element={<Grievance />} />
      </Route>

      <Route path="seller/login" element={<SellerLogin />} />
      <Route path="seller/register" element={<SellerRegister />} />
      <Route path="seller" element={<SellerLayout />}>
        <Route index element={<SellerDashboard />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="products/new" element={<SellerProductForm />} />
        <Route path="products/:id/edit" element={<SellerProductForm />} />
        <Route path="enquiries" element={<SellerEnquiries />} />
      </Route>

      <Route path="matrimony/login" element={<MatrimonyLogin />} />
      <Route path="matrimony/register" element={<MatrimonyRegister />} />
      <Route path="matrimony/member" element={<MatrimonyLayout />}>
        <Route index element={<MatrimonyMemberDashboard />} />
        <Route path="profile" element={<MatrimonyMemberProfileForm />} />
        <Route path="enquiries" element={<MatrimonyEnquiries />} />
      </Route>

      <Route path="admin/login" element={<AdminThemeProvider><AdminLogin /></AdminThemeProvider>} />
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/create" element={<ArticleForm />} />
        <Route path="articles/edit/:id" element={<ArticleForm />} />
        <Route path="categories" element={<Categories />} />
        <Route path="authors" element={<Authors />} />
        <Route path="media" element={<Media />} />
        <Route path="breaking-news" element={<BreakingNewsAdmin />} />
        <Route path="advertisements" element={<Advertisements />} />
        <Route path="adsense" element={<AdSenseAdmin />} />
        <Route path="google-analytics" element={<GoogleAnalyticsAdmin />} />
        <Route path="features" element={<FeaturesAdmin />} />
        <Route path="feature-content" element={<FeatureContentAdmin />} />
        <Route path="marketplace" element={<AdminMarketplace />} />
        <Route path="matrimony" element={<MatrimonyDashboard />} />
        <Route path="matrimony/add" element={<MatrimonyProfileForm />} />
        <Route path="matrimony/edit/:id" element={<MatrimonyProfileForm />} />
        <Route path="matrimony/view/:id" element={<MatrimonyProfileView />} />
        <Route path="matrimony/enquiries/:id" element={<MatrimonyProfileEnquiries />} />
        <Route path="matrimony/profiles" element={<MatrimonyProfileList />} />
        <Route path="matrimony/pending" element={<MatrimonyProfileList />} />
        <Route path="matrimony/approved" element={<MatrimonyProfileList />} />
        <Route path="matrimony/rejected" element={<MatrimonyProfileList />} />
        <Route path="matrimony/featured" element={<MatrimonyProfileList />} />
        <Route path="matrimony/verified" element={<MatrimonyProfileList />} />
        <Route path="matrimony/categories" element={<MatrimonyCategories />} />
        <Route path="matrimony/settings" element={<MatrimonySettings />} />
        <Route path="youtube-slider" element={<YoutubeSliderAdmin />} />
        <Route path="instagram-posts" element={<InstagramPostsAdmin />} />
        <Route path="google-news" element={<GoogleNewsAdmin />} />
        <Route path="travel-notifications" element={<TravelNotificationsAdmin />} />
        <Route path="sports-live" element={<SportsLiveAdmin />} />
        <Route path="government-notifications" element={<GovernmentNotificationsAdmin />} />
        <Route path="aeo-geo" element={<AeoGeo />} />
        <Route path="users" element={<Users />} />
        <Route path="role-permissions" element={<RolePermissions />} />
        <Route path="settings" element={<Settings />} />
        <Route path="page-menu" element={<PageMenuLayout />}>
          <Route index element={<AboutPageEditor />} />
          <Route path="about" element={<AboutPageEditor />} />
        </Route>
      </Route>
    </Routes>
    </>
  );
}

export default App;
