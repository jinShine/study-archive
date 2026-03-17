import React from 'react';
import { useForm } from 'react-hook-form';

// 가짜 API: 'admin'이라는 아이디만 중복된 것으로 처리 (1.5초 지연)
const checkIdDuplicate = async (id: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return id !== 'admin';
};

export default function AsyncValidationForm() {
  const { register, handleSubmit, formState: { errors, isValidating, isSubmitting } } = useForm({
    mode: "onBlur"
  });

  const onSubmit = (data: any) => console.log("최종 제출:", data);

  return (
    <div className="p-10 max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 font-sans">
      <h1 className="text-2xl font-black mb-8 text-slate-900 tracking-tight">Async Validator</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 flex flex-col">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">User ID</label>
          <div className="relative">
            <input
              {...register("userId", {
                required: "아이디는 필수입니다.",
                validate: async (v) => (await checkIdDuplicate(v)) || "이미 사용 중인 아이디입니다 (admin 제외)"
              })}
              className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${errors.userId ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-indigo-500'}`}
              placeholder="아이디를 입력하고 탭(Tab)을 눌러보세요"
            />
            {isValidating && (
              <div className="absolute right-4 top-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-bold text-indigo-500">Checking...</span>
              </div>
            )}
          </div>
          {errors.userId && <p className="text-rose-500 text-xs font-bold mt-1 ml-1">{errors.userId.message as string}</p>}
        </div>

        <button
          disabled={isValidating || isSubmitting}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isValidating ? "검증 대기 중..." : "계정 생성"}
        </button>
      </form>
      <p className="mt-6 text-[10px] text-slate-400 text-center italic leading-relaxed">
        'admin'을 입력하고 인풋 밖을 클릭하면 중복 에러가 발생합니다.<br/>
        네트워크 요청 중에는 버튼이 자동으로 비활성화됩니다.
      </p>
    </div>
  );
}