import React, { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";

function RenderCounter({ name }: { name: string }) {
  const count = useRef(0);
  count.current++;
  return (
    <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-1 rounded-full font-bold">
      {name} Renders: {count.current}
    </span>
  );
}

function TitleWatcher({ control }: { control: any }) {
  const title = useWatch({ control, name: "title" });
  return (
    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-indigo-600">useWatch Mode</h3>
        <RenderCounter name="ChildComponent" />
      </div>
      <p className="text-indigo-900 font-medium italic">"{title || "Typing..."}"</p>
    </div>
  );
}

export default function PerformanceDeepDive() {
  const { register, control, getValues } = useForm({ defaultValues: { title: "" } });

  return (
    <div className="p-10 max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-100">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900">Performance Lab</h1>
        <RenderCounter name="ParentContainer" />
      </header>

      <div className="space-y-6">
        <input
          {...register("title")}
          className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl transition-all outline-none"
          placeholder="데이터를 입력하세요"
        />
        <TitleWatcher control={control} />
        <button
          type="button"
          onClick={() => console.log(getValues("title"))}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all"
        >
          getValues (No Render)
        </button>
      </div>
    </div>
  );
}