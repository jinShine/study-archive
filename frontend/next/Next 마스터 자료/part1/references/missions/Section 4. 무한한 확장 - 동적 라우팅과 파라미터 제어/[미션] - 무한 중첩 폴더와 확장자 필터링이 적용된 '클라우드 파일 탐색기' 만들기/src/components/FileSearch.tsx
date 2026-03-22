import React from "react";
export default function FileSearch({ initialQuery, actionPath }: { initialQuery?: string; actionPath: string; }) {
  return (
    <form action={actionPath} className="flex items-center space-x-2 w-full max-w-sm">
      <input name="q" type="text" placeholder="현재 폴더에서 파일 검색..." defaultValue={initialQuery} className="flex-1 border border-gray-300 rounded-md py-2 px-4 text-black focus:ring-2 focus:ring-blue-500 outline-none" />
      <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-bold">검색</button>
    </form>
  );
}
