import React from "react";

export default function SearchForm({ initialQuery }: { initialQuery?: string }) {
  return (
    <form action="/posts" className="flex items-center space-x-2 w-full max-w-sm">
      <input
        name="q"
        type="text"
        placeholder="블로그 글 검색..."
        defaultValue={initialQuery}
        className="flex-1 border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
      />
      <button 
        type="submit"
        className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
      >
        검색
      </button>
    </form>
  );
}
