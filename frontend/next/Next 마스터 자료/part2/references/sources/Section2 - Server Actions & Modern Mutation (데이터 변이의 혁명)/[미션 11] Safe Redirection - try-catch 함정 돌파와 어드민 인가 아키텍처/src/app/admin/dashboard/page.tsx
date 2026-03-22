import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.get('admin_session');

  // 최상단 검증 로직에서는 try-catch가 없으므로 redirect를 안심하고 씁니다.
  if (!hasSession) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10 pb-6 border-b-2 border-slate-200">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">🦆 아키텍트 통제실</h1>
          <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-bold text-sm">
            ✅ 보안 세션 활성화
          </span>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">시스템 상태</h2>
            <p className="text-slate-600">모든 마이크로서비스가 정상 작동 중입니다.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">멘토링 대기열</h2>
            <p className="text-3xl font-black text-indigo-600">12 건</p>
          </div>
        </div>
      </div>
    </div>
  );
}