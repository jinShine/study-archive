import Link from "next/link";
export default function SettingsLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-slate-800">설정 센터</h1>
      <div className="flex gap-4 border-b border-slate-200 mb-8 text-sm font-bold">
        <Link href="/dashboard/settings/profile" className="pb-2 border-b-2 border-emerald-500">프로필</Link>
        <Link href="/dashboard/settings/security" className="pb-2 text-slate-400">보안</Link>
      </div>
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">{children}</section>
    </div>
  );
}
