export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ta-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('ta-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('ta-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'இப்போது';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} நிமிடங்களுக்கு முன்`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} மணி நேரத்திற்கு முன்`;
  return formatDate(date);
};

import { getImageUrl, DEFAULT_NEWS_IMAGE } from './images';

export { getImageUrl, DEFAULT_NEWS_IMAGE };

export const truncate = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export const NAV_ITEMS = [
  { label: 'முகப்பு', path: '/' },
  { label: 'தமிழ்நாடு', path: '/tamil-nadu' },
  { label: 'சென்னை', path: '/chennai' },
  { label: 'இந்தியா', path: '/india' },
  { label: 'உலகம்', path: '/world' },
  { label: 'அரசியல்', path: '/politics' },
  { label: 'வணிகம்', path: '/business' },
  { label: 'விளையாட்டு', path: '/sports' },
  { label: 'சினிமா', path: '/cinema' },
  { label: 'தொழில்நுட்பம்', path: '/technology' },
  { label: 'கல்வி', path: '/education' },
  { label: 'வேலைவாய்ப்பு', path: '/jobs' },
  { label: 'ஆன்மிகம்', path: '/spiritual' },
  { label: 'சிறப்பு', path: '/special' },
];

export const CATEGORY_SLUGS = [
  'tamil-nadu', 'chennai', 'india', 'world', 'politics', 'business',
  'sports', 'cinema', 'technology', 'education', 'jobs', 'spiritual', 'special',
];
