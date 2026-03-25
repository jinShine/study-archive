import * as z from 'zod';
export const SignupFormSchema = z.object({
  name: z.string().min(2, { message: '이름은 최소 2글자 이상이어야 합니다.' }).trim(),
  email: z.string().email({ message: '유효한 이메일 형식을 입력해주세요.' }).trim(),
  password: z.string().min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }).regex(/[a-zA-Z]/, { message: '영문자가 하나 이상 포함되어야 합니다.' }).regex(/[0-9]/, { message: '숫자가 하나 이상 포함되어야 합니다.' }).regex(/[^a-zA-Z0-9]/, { message: '특수문자가 하나 이상 포함되어야 합니다.' }).trim(),
});
export type FormState = { errors?: { name?: string[]; email?: string[]; password?: string[] }; message?: string; } | undefined;
export type SessionPayload = { userId: string; role: string; team: string; expiresAt: Date };