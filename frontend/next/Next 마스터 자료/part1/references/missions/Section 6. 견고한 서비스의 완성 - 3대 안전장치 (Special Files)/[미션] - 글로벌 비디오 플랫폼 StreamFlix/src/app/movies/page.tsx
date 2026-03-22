export default async function Page() {
  await new Promise(r => setTimeout(r, 3000));
  return (
    <div className="p-10">
      <h1 className="text-4xl font-black mb-10">Trending Now</h1>
      <div className="grid grid-cols-3 gap-8">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="p-6 bg-gray-900 rounded-2xl h-80 border border-gray-800">
             <h3 className="text-xl font-bold">Movie Title {i}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
