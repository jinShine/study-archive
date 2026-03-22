'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { db } from '@/lib/db';

export interface FormState { success: boolean; message: string; }

export async function toggleVipModeAction() {
  const cookieStore = await cookies();
  const isVip = cookieStore.get('vip_mode')?.value === 'true';
  await new Promise(res => setTimeout(res, 800));
  cookieStore.set('vip_mode', isVip ? 'false' : 'true', { httpOnly: true, path: '/' });
  revalidatePath('/', 'layout');
}

export async function createProposalAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const title = formData.get('title') as string;
  let isSuccess = false;
  try {
    await new Promise(res => setTimeout(res, 1000));
    if (!title || title.length < 5) throw new Error("제목은 5자 이상이어야 합니다.");
    db.proposals.unshift({ id: `PROP_${Date.now()}`, title, votes: 0 });
    isSuccess = true;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: error instanceof Error ? error.message : "서버 오류" };
  }
  if (isSuccess) {
    revalidatePath('/');
    redirect('/');
  }
  return { success: true, message: "" };
}

export async function voteProposalAction(id: string, newVotes: number) {
  await new Promise(res => setTimeout(res, 1000));
  if (Math.random() < 0.1) throw new Error("네트워크 오류! 투표가 취소됩니다.");
  const proposal = db.proposals.find(p => p.id === id);
  if (proposal) proposal.votes = newVotes;
  revalidatePath('/');
}