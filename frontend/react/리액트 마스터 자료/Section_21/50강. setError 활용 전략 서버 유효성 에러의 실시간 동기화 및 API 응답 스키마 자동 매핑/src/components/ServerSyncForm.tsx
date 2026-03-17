import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

interface FormInputs {
  username: string;
  email: string;
}

// 가짜 API: 무조건 서버 에러를 반환하도록 설계됨
const mockRegisterApi = async (data: FormInputs) => {
  await new Promise((resolve) => setTimeout(resolve, 800)); // 통신 지연 시뮬레이션
  throw {
    response: {
      data: {
        errors: {
          username: "이미 사용 중인 이름입니다.",
          email: "차단된 이메일 도메인입니다."
        }
      }
    }
  };
};

export default function ServerSyncForm() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormInputs>({
    reValidateMode: "onChange"
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    try {
      await mockRegisterApi(data);
      alert("성공!");
    } catch (error: any) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        // [핵심] 서버 에러 객체를 순회하며 RHF 엔진에 주입
        Object.entries(serverErrors).forEach(([key, message]) => {
          setError(key as keyof FormInputs, {
            type: "server",
            message: message as string
          });
        });
      }
    }
  };

  return (
    <div className="p-10 max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 font-sans">
      <h1 className="text-2xl font-black mb-8 text-slate-900 tracking-tight">Server Error Sync</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
          <input
            {...register("username")}
            className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${errors.username ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-indigo-500'}`}
            placeholder="아이디 입력"
          />
          {errors.username && <p className="text-rose-500 text-xs font-bold mt-1 ml-1">{errors.username.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
          <input
            {...register("email")}
            className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${errors.email ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-indigo-500'}`}
            placeholder="이메일 입력"
          />
          {errors.email && <p className="text-rose-500 text-xs font-bold mt-1 ml-1">{errors.email.message}</p>}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? "서버 확인 중..." : "회원가입 요청"}
        </button>
      </form>
      <p className="mt-6 text-xs text-slate-400 text-center italic">제출 버튼을 누르면 서버 에러가 자동으로 매핑됩니다.</p>
    </div>
  );
}