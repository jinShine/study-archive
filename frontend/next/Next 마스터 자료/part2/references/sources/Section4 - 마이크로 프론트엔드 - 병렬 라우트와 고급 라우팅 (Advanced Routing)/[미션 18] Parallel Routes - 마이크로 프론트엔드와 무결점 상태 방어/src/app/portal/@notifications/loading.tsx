export default function NotificationsLoading() {
  return (
    <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 h-full flex flex-col items-center justify-center animate-pulse">
      <span className="text-3xl mb-2">🔔</span>
      <p className="text-amber-600 font-bold text-sm">알림 동기화 중...</p>
    </div>
  );
}