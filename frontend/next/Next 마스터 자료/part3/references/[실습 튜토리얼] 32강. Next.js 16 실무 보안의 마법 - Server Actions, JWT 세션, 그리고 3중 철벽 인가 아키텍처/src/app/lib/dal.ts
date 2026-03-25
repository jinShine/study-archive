import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { decrypt } from './session';
import { redirect } from 'next/navigation';
import { getUserFromDb } from './db';

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  if (!session?.userId) redirect('/');
  return { isAuth: true, userId: session.userId as string, role: session.role };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;
  try {
    const data = await getUserFromDb(session.userId);
    return data;
  } catch (error) { return null; }
});