'use client';
import { useAlertStore } from './AlertProvider';
export function AlertDisplay() {
  const isVisible = useAlertStore((state) => state.isVisible);
  const message = useAlertStore((state) => state.message);
  const hide = useAlertStore((state) => state.hideAlert);
  if (!isVisible) return null;
  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 p-8 bg-indigo-600 text-white rounded-3xl shadow-2xl z-50 text-center min-w-[300px]">
      <p className="text-xl font-black mb-4">{message}</p>
      <button onClick={hide} className="px-6 py-2 bg-white/20 rounded-full font-bold hover:bg-white/30 transition-all">알림 닫기</button>
    </div>
  );
}
export function AlertTrigger() {
  const show = useAlertStore((state) => state.showAlert);
  return (
    <button
      onClick={() => show('연습 문제 미션 완료! 축하합니다!')}
      className="px-12 py-6 bg-emerald-500 text-white font-black text-xl rounded-3xl shadow-2xl hover:bg-emerald-600 transition-all active:scale-95"
    >
      알림 벨 누르기
    </button>
  );
}