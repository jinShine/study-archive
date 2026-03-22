import { safeCreatePostAction } from "../actions";
export default function WritePage() {
  return (
    <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h1 className="text-2xl font-black mb-6 text-gray-900 uppercase">New Post</h1>
      <form action={safeCreatePostAction} className="flex flex-col gap-5">
        <input name="title" placeholder="게시글 제목" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0070f3]" required />
        <button type="submit" className="w-full p-4 bg-[#0070f3] text-white rounded-xl font-bold shadow-lg">발행 및 목록 이동</button>
      </form>
    </div>
  );
}