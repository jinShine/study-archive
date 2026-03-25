import { getProfileDTO } from '@/app/lib/dto';
import { logout } from '@/app/actions/auth';
import { AdminActions } from '@/app/ui/admin-actions';

export default async function DashboardPage() {
  const user = await getProfileDTO();
  return (
    <main className="p-10 w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-4">보안 대시보드 (VIP 룸)</h1>
      <div className="p-6 bg-blue-50 rounded-lg text-lg space-y-2 mb-8">
        <p><strong>이름:</strong> {user?.name} 님</p>
        <p><strong>이메일:</strong> {user?.email}</p>
        <p><strong>연락처:</strong> {user?.phoneNumber || '권한 없음'}</p>
        <p className="mt-4 text-sm text-blue-700 font-bold bg-blue-100 p-3 rounded">
          🎉 프록시, DAL, DTO 3중 방어망을 완벽히 통과하셨습니다!
        </p>
      </div>
      <AdminActions />
      <form action={logout} className="mt-8">
        <button type="submit" className="w-full bg-gray-500 text-white font-bold p-3 rounded hover:bg-gray-600 transition">
          로그아웃 (세션 파기)
        </button>
      </form>
    </main>
  );
}