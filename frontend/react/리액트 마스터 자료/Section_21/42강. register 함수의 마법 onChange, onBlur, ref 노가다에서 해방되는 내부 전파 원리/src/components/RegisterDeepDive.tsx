import React from 'react';
import { useForm } from 'react-hook-form';

export default function RegisterDeepDive() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  // 🔍 register("testField")가 반환하는 실제 객체를 가져옵니다.
  const testRegister = register("testField", { required: "필수값입니다." });

  // 브라우저 개발자 도구 콘솔에서 { name, onChange, onBlur, ref }를 확인하세요!
  console.log("🛠 register('testField')가 반환하는 가방 내용물:", testRegister);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <header style={{ borderBottom: '2px solid #333', marginBottom: '20px' }}>
        <h1>Register Deep Dive</h1>
        <p>콘솔창(F12)을 열어 register 함수가 반환하는 객체를 확인하세요.</p>
      </header>

      <form onSubmit={handleSubmit((data) => console.log("제출 데이터:", data))}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>자동 배선 (register)</label>
          <input
            {...testRegister}
            placeholder="마법이 일어나는 곳"
            style={{ padding: '12px', width: '300px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          {errors.testField && <p style={{ color: 'red' }}>{errors.testField.message}</p>}
        </div>

        <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#007aff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          데이터 제출 및 콘솔 확인
        </button>
      </form>
    </div>
  );
}