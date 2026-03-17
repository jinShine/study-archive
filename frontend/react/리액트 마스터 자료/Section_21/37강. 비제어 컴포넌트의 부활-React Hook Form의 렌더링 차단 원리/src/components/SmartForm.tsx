import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

interface FormInputs {
  firstName: string;
  email: string;
}

export default function SmartForm() {
  const { register, handleSubmit } = useForm<FormInputs>();
  const onSubmit: SubmitHandler<FormInputs> = (data) => console.log("RHF 수집:", data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ border: '1px solid blue', padding: '10px', marginTop: '10px' }}>
      <h3>Smart (React Hook Form)</h3>
      <input {...register("firstName")} placeholder="성함" />
      <input {...register("email")} placeholder="이메일" />
      <button type="submit">제출</button>
    </form>
  );
}