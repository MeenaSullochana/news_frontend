import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import BreakingNews from '../components/BreakingNews';
import Footer from '../components/Footer';
import { settingService } from '../services/articleService';

const PublicLayout = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    settingService
      .getPublic()
      .then(({ data }) => setSettings(data.data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header settings={settings} />
      <BreakingNews />
      <main className="flex-1">
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export default PublicLayout;
