import Link from "next/link";
export default function RootPage() {
  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center bg-white text-slate-900">
      <h1 className="text-6xl font-black italic mb-4">NEXUS.</h1>
      <p className="text-slate-500 mb-10">전역 레이아웃만 적용된 메인 화면입니다.</p>
      <Link href="/dashboard" className="px-10 py-4 bg-emerald-600 text-white font-black rounded-full shadow-xl">대시보드 입장</Link>
    </div>
  );
}
