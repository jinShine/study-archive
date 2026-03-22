'use client';
import { useOptimistic, useTransition } from 'react';
import { voteProposalAction, toggleVipModeAction } from '../actions';

export function VipModeButton({ isVip }: { isVip: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button onClick={() => startTransition(() => toggleVipModeAction())} disabled={isPending}
      className={`px-6 py-2 rounded-full font-bold shadow-md transition-all ${isPending ? 'bg-slate-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white'}`}>
      {isPending ? '🔄 모드 전환 중...' : isVip ? '👑 일반 모드로 복귀' : '👑 VIP 리뷰어 모드 켜기'}
    </button>
  );
}

export function VoteButton({ id, initialVotes }: { id: string, initialVotes: number }) {
  const [optimisticVotes, addOptimisticVote] = useOptimistic(initialVotes, (state, amount: number) => state + amount);
  const handleVote = async () => {
    addOptimisticVote(1);
    try { await voteProposalAction(id, optimisticVotes + 1); } 
    catch (e: any) { alert(e.message); }
  };
  return (
    <form action={handleVote}>
      <button type="submit" className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-black hover:bg-emerald-200 transition-colors cursor-pointer active:scale-95">
        👍 {optimisticVotes}
      </button>
    </form>
  );
}