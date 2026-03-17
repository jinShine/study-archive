import React from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";

interface CareerForm {
  careers: { company: string; role: string; }[];
}

export default function AdvancedDynamicForm() {
  const { register, control, handleSubmit } = useForm<CareerForm>({
    defaultValues: { careers: [{ company: "", role: "" }] }
  });

  // append, remove뿐만 아니라 move, insert까지 추출합니다.
  const { fields, append, remove, move, insert } = useFieldArray({
    control,
    name: "careers"
  });

  return (
    <div className="p-10 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <h1 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">Dynamic Career Manager</h1>
        
        <form onSubmit={handleSubmit(d => console.log(d))} className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="group p-6 border border-slate-200 rounded-2xl bg-white transition-all hover:border-indigo-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">Item #{index + 1}</span>
                <div className="flex gap-2">
                  {/* move 기능: 위/아래 순서 바꾸기 */}
                  <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} className="text-xs bg-slate-100 px-2 py-1 rounded disabled:opacity-30">▲</button>
                  <button type="button" onClick={() => move(index, index + 1)} disabled={index === fields.length - 1} className="text-xs bg-slate-100 px-2 py-1 rounded disabled:opacity-30">▼</button>
                  <button type="button" onClick={() => remove(index)} className="text-xs bg-rose-50 text-rose-500 px-2 py-1 rounded">삭제</button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input {...register(`careers.${index}.company` as const)} placeholder="회사명" className="border-b py-2 outline-none focus:border-indigo-500" />
                <input {...register(`careers.${index}.role` as const)} placeholder="직무" className="border-b py-2 outline-none focus:border-indigo-500" />
              </div>

              {/* insert 기능: 현재 항목 아래에 새로운 칸 끼워넣기 */}
              <button 
                type="button" 
                onClick={() => insert(index + 1, { company: "", role: "" })}
                className="mt-4 text-[10px] text-slate-400 hover:text-indigo-500 transition-colors"
              >
                + 이 아래에 항목 끼워넣기 (Insert)
              </button>
            </div>
          ))}

          <button 
            type="button" 
            onClick={() => append({ company: "", role: "" })}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 hover:border-indigo-200 transition-all"
          >
            + 맨 끝에 항목 추가 (Append)
          </button>

          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100">
            데이터 전송하기
          </button>
        </form>
      </div>
    </div>
  );
}