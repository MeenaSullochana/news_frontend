const Loading = ({ text = 'ஏற்றுகிறது...' }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    <p className="mt-4 text-gray-500 text-sm">{text}</p>
  </div>
);

export const SkeletonCard = () => (
  <div className="card-news">
    <div className="skeleton h-48 w-full" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-20" />
      <div className="skeleton h-5 w-full" />
      <div className="skeleton h-5 w-3/4" />
    </div>
  </div>
);

export const SkeletonList = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-3">
        <div className="skeleton w-24 h-16 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default Loading;
