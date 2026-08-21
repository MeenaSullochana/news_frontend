import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import Category from './pages/Category';
import DistrictPage from './pages/DistrictPage';
import Article from './pages/Article';
import Search from './pages/Search';
import Author from './pages/Author';
import {
  About, Contact, PrivacyPolicy, Terms,
  EditorialPolicy, CorrectionPolicy, Copyright, Grievance,
} from './pages/StaticPages';

import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import Dashboard from './admin/Dashboard';
import Articles from './admin/Articles';
import ArticleForm from './admin/ArticleForm';
import Categories from './admin/Categories';
import Authors from './admin/Authors';
import Media from './admin/Media';
import BreakingNewsAdmin from './admin/BreakingNewsAdmin';
import Advertisements from './admin/Advertisements';
import Users from './admin/Users';
import Settings from './admin/Settings';

const CATEGORY_ROUTES = [
  'tamil-nadu', 'chennai', 'india', 'world', 'politics', 'business',
  'sports', 'cinema', 'technology', 'education', 'jobs', 'spiritual', 'special',
];

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        {CATEGORY_ROUTES.map((slug) => (
          <Route key={slug} path={slug} element={<Category />} />
        ))}
        <Route path="tamil-nadu/:district" element={<DistrictPage />} />
        <Route path="news/:slug" element={<Article />} />
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

      <Route path="admin/login" element={<AdminLogin />} />
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
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
