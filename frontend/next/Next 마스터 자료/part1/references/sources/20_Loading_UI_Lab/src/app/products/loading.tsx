export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-8">
      <div className="max-w-7xl mx-auto">
        {/* 제목 뼈대 */}
        <div className="h-10 w-48 bg-slate-200 rounded-xl mb-10 animate-pulse"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="h-4 w-20 bg-slate-100 rounded-full mb-4 animate-pulse"></div>
              <div className="h-6 w-3/4 bg-slate-200 rounded-lg mb-2 animate-pulse"></div>
              <div className="h-5 w-1/4 bg-slate-100 rounded-lg mb-8 animate-pulse"></div>
              <div className="h-12 w-full bg-slate-100 rounded-2xl animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
