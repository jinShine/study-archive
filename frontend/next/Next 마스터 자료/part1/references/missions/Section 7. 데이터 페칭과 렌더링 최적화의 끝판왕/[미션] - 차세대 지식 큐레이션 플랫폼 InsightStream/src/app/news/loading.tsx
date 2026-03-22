export default function Loading() {
  return (
    <div className="p-12 animate-pulse">
      <div className="h-12 w-64 bg-slate-200 rounded-lg mb-12" />
      <div className="grid grid-cols-3 gap-8">
        {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-[2rem]" />)}
      </div>
    </div>
  );
}
