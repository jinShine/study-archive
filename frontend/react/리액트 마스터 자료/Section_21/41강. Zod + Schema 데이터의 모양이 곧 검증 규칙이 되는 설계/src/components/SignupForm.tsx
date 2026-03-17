import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '../schemas/authSchema';

export default function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onChange"
  });

  const onSubmit: SubmitHandler<SignupInput> = (data) => console.log("Final Data:", data);

  return (
    <div style={{ padding: '30px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input {...register("email")} placeholder="Email" style={{ padding: '10px' }} />
        {errors.email && <p style={{color: 'red', fontSize: '11px'}}>{errors.email.message}</p>}
        <input type="password" {...register("password")} placeholder="Password" style={{ padding: '10px' }} />
        <input type="password" {...register("passwordConfirm")} placeholder="Confirm" style={{ padding: '10px' }} />
        {errors.passwordConfirm && <p style={{color: 'red', fontSize: '11px'}}>{errors.passwordConfirm.message}</p>}
        <button type="submit" style={{ padding: '12px', background: '#007aff', color: '#fff', border: 'none', borderRadius: '6px' }}>가입하기</button>
      </form>
    </div>
  );
}
