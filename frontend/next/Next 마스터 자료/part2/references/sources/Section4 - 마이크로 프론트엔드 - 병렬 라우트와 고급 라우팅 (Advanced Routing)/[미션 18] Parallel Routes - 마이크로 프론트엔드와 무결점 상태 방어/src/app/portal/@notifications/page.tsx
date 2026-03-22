export default async function NotificationsSlot() {
  await new Promise(res => setTimeout(res, 1000));
  return (
    <div className="bg-amber-50 p-6 rounded-3xl shadow-sm border border-amber-200 h-full">
      <h3 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
        <span>🔔</span> 최신 공지사항
      </h3>
      <ul className="space-y-3">
        <li className="p-3 bg-white rounded-xl shadow-sm text-amber-900 font-medium text-sm border border-amber-100">
          [필독] Next.js 16 아키텍처 특강 오픈!
        </li>
      </ul>
    </div>
  );
}