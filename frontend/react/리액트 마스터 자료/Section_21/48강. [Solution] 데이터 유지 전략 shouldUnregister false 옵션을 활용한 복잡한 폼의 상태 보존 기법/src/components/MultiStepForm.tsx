import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const methods = useForm({
    shouldUnregister: false, // 💡 언마운트 시 데이터 보호
    defaultValues: { step1: { name: "" }, step2: { bio: "" } }
  });

  const onSubmit = (data: any) => console.log("Merged Data:", data);

  return (
    <div className="p-10 max-w-lg w-full bg-white rounded-[2rem] shadow-2xl border border-slate-100 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Persistence Form</h1>
        <div className="flex gap-2 mt-4">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-indigo-500' : 'bg-slate-100'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-indigo-500' : 'bg-slate-100'}`} />
        </div>
      </header>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="min-h-[120px] flex flex-col justify-between">
          <div className="flex-1">
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
          </div>

          <footer className="flex gap-4 mt-10">
            {step > 1 && (
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 font-bold rounded-2xl">이전</button>
            )}
            {step === 1 ? (
              <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg">다음 단계</button>
            ) : (
              <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl">최종 제출</button>
            )}
          </footer>
        </form>
      </FormProvider>
    </div>
  );
}