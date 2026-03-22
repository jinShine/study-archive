export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-indigo-100"></div>
        <p className="text-indigo-600 font-black text-lg animate-pulse tracking-tight">
          Loading System...
        </p>
      </div>
    </div>
  );
}
