import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import FormField from "./FormField";

export default function PremiumAccessibleForm() {
  const methods = useForm({ 
    defaultValues: { email: "", password: "" },
    mode: "onBlur"
  });

  const onSubmit = (data: any) => console.log("Final Data:", data);

  return (
    <div className="p-12 max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/20">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Secure Access</h1>
        <p className="text-slate-400 text-sm font-medium">모두를 위한 평등한 디지털 경험</p>
      </header>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          
          <FormField label="Email Identity" name="email">
            {(id, errorId) => (
              <input
                id={id}
                {...methods.register("email", { 
                  required: "이메일은 필수 입력 항목입니다.",
                  pattern: { value: /\S+@\S+\.\S+/, message: "올바른 이메일 형식이 아닙니다." }
                })}
                aria-invalid={methods.formState.errors.email ? "true" : "false"}
                aria-describedby={methods.formState.errors.email ? errorId : undefined}
                className="w-full p-4 bg-slate-100/50 border-2 border-transparent rounded-2xl outline-none transition-all duration-300
                  focus:bg-white focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)]
                  aria-[invalid=true]:border-rose-500 aria-[invalid=true]:bg-rose-50/50 aria-[invalid=true]:focus:shadow-[0_0_0_4px_rgba(244,63,94,0.1)]"
                placeholder="name@company.com"
              />
            )}
          </FormField>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
          >
            대시보드 입장하기
          </button>
        </form>
      </FormProvider>

      <footer className="mt-8 pt-8 border-t border-slate-100 text-center">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">A11y Automation Engine v4.0</span>
      </footer>
    </div>
  );
}