import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().trim().min(1, "이메일은 필수입니다.").email("형식이 올바르지 않습니다."),
  password: z.string().min(8, "8자 이상 입력하세요."),
  passwordConfirm: z.string().min(1, "비밀번호 확인 필수")
}).refine(data => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["passwordConfirm"]
});

export type SignupInput = z.infer<typeof signupSchema>;
