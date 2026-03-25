'use server';
import { SignupFormSchema, FormState } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { createSession, deleteSession } from '@/app/lib/session';
import { redirect } from 'next/navigation';
import { mockUsers } from '@/app/lib/db';

export async function signup(state: FormState, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) return { errors: validatedFields.error.flatten().fieldErrors };
  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUserId = String(Date.now());
  const role = "admin";
  const team = "A-Team";
  mockUsers.push({ id: newUserId, name, email, password: hashedPassword, role, team, phoneNumber: "010-1234-5678" });
  await createSession(newUserId, role, team);
  redirect('/dashboard');
}
export async function logout() {
  await deleteSession();
  redirect('/');
}