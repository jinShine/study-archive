export default function NotificationsDefault() {
  return (
    <div className="bg-slate-200 p-6 rounded-3xl h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-400">
      <h3 className="text-lg font-bold text-slate-600 mb-2">🔔 알림 (안전 모드)</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">
        하드 네비게이션 발생!<br/>404 에러를 방어합니다.
      </p>
    </div>
  );
}