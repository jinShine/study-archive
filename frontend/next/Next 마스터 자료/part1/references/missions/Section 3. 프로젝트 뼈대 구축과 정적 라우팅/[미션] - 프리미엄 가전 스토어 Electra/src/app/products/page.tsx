import Link from "next/link";
const DATA = [
  {id:1, name:"Fridge", price:2000, cat:"kitchen"},
  {id:2, name:"TV", price:3000, cat:"living"},
  {id:3, name:"Oven", price:1000, cat:"kitchen"}
];

export default async function Page({ searchParams }: { searchParams: Promise<{sort?:string, cat?:string}> }) {
  const { sort, cat } = await searchParams;
  let items = [...DATA];
  if (cat) items = items.filter(i => i.cat === cat);
  if (sort === "asc") items.sort((a,b) => a.price - b.price);
  if (sort === "desc") items.sort((a,b) => b.price - a.price);

  return (
    <div className="p-10">
      <div className="flex gap-2 mb-10">
        <Link href="/products?cat=kitchen" className="p-2 border rounded">Kitchen</Link>
        <Link href="/products?cat=living" className="p-2 border rounded">Living</Link>
        <Link href="/products?sort=asc" className="p-2 bg-indigo-600 text-white rounded">Low Price</Link>
        <Link href="/products" className="p-2 bg-gray-200 rounded">Reset</Link>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {items.map(i => (
          <div key={i.id} className="p-6 bg-white rounded-2xl shadow-sm">
            <h2 className="font-bold">{i.name}</h2>
            <p className="text-indigo-600 font-black">${i.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
