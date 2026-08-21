const ShareButtons = ({ url, title }) => {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : url;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shares = [
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-green-500',
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-blue-600',
    },
    {
      name: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-black',
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-sky-500',
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 mr-2">Share:</span>
      {shares.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${s.color} text-white text-xs px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity`}
        >
          {s.name}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-gray-300 transition-colors"
      >
        Copy Link
      </button>
    </div>
  );
};

export default ShareButtons;
