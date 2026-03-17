import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { UserProfileForm } from '../types/form';

export default function TypedForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<UserProfileForm>({
    defaultValues: {
      userName: "",
      userEmail: "",
      userAge: 20,
      preferences: { theme: 'light', notifications: true }
    },
    mode: 'onChange'
  });

  const onSave: SubmitHandler<UserProfileForm> = (data) => {
    console.log("데이터 수집 완료:", data);
    alert(`성공: ${data.userName}님 반갑습니다.`);
  };

  return (
    <form onSubmit={handleSubmit(onSave)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <input {...register("userName")} placeholder="이름" />
      <input {...register("userEmail")} placeholder="이메일" />
      <input type="number" {...register("userAge")} placeholder="나이" />
      <select {...register("preferences.theme")}>
        <option value="light">라이트</option>
        <option value="dark">다크</option>
      </select>
      <button type="submit">저장</button>
    </form>
  );
}