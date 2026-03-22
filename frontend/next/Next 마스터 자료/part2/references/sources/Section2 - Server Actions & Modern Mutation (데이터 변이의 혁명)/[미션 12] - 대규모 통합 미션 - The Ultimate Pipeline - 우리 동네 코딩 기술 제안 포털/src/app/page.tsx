import Link from 'next/link';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { VoteButton, VipModeButton } from './components/InteractiveButtons';

export default async function HomePage() {
  const proposals = db.proposals;
  const cookieStore = await cookies();
  const isVip = cookieStore.get('vip_mode')?.value === 'true';
  return (
    <div className="max-w-4xl mx-auto p-10">
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-700/20">
        <h1 className="text-4xl font-black tracking-tighter">🚀 Tech Proposals</h1>
        <VipModeButton isVip={isVip} />
      </header>
      <Link href="/proposals/new" className="block w-full text-center bg-indigo-600 text-white p-4 rounded-2xl font-bold mb-10 hover:bg-indigo-700 shadow-lg cursor-pointer">
        + 새로운 기술 제안서 작성하기
      </Link>
      <div className="space-y-4">
        {proposals.map(p => (
          <div key={p.id} className="p-6 bg-white/5 border border-slate-700/20 rounded-2xl shadow-sm flex justify-between items-center backdrop-blur-sm">
            <h2 className="text-xl font-bold">{p.title}</h2>
            <VoteButton id={p.id} initialVotes={p.votes} />
          </div>
        ))}
      </div>
    </div>
  );
}