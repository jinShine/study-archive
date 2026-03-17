import React from 'react';
import { useForm } from 'react-hook-form';
import { getDirtyValues } from '../utils/getDirtyValues';

const initialData = {
  profile: { name: "홍길동", role: "Developer" },
  settings: { theme: "dark", notifications: true }
};

export default function PatchForm() {
  const { register, handleSubmit, formState: { dirtyFields, isDirty } } = useForm({
    defaultValues: initialData
  });

  const onSubmit = (data: any) => {
    const patchData = getDirtyValues(data, dirtyFields);
    console.log("🔥 전송할 데이터 (PATCH):", patchData);
    alert("바뀐 데이터만 콘솔에 출력되었습니다.");
  };

  return (
    <div className="p-10 max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 font-sans">
      <h1 className="text-2xl font-black mb-6">Smart PATCH Form</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <input {...register("profile.name")} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Name" />
          <input {...register("profile.role")} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="Role" />
        </div>
        <button
          disabled={!isDirty}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black disabled:opacity-30"
        >
          수정사항 저장 (PATCH)
        </button>
      </form>
    </div>
  );
}