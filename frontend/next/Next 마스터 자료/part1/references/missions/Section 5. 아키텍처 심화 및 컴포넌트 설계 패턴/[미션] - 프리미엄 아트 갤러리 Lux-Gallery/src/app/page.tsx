import Link from 'next/link';
export default function Page() {
  return (<div className="p-20 text-center"><h1 className="text-6xl font-black mb-10 text-stone-800">Premium Art Archive</h1><Link href="/gallery" className="bg-stone-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest">Enter Gallery</Link></div>);
}
