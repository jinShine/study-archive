export default function MoviesLoading() {
  return (
    <div className="p-10 animate-pulse">
      <div className="h-10 w-64 bg-gray-800 rounded-lg mb-10"></div>
      <div className="grid grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-6 bg-gray-800 rounded-2xl h-80 border border-gray-700"></div>
        ))}
      </div>
    </div>
  );
}
