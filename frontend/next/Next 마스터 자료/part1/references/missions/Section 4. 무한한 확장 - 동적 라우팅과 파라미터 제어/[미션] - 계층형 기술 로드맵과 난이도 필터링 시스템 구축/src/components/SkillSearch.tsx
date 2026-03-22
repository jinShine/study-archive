import React from "react";
export default function SkillSearch({ initialQuery, actionPath }: { initialQuery?: string; actionPath: string; }) {
  return (
    <form action={actionPath} className="flex items-center space-x-2 w-full max-w-lg">
      <input name="q" type="text" placeholder="기술명 검색..." defaultValue={initialQuery} className="flex-1 border border-slate-200 rounded-xl py-3 px-4 text-black outline-none focus:ring-2 focus:ring-blue-500" />
      <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold">검색</button>
    </form>
  );
}
