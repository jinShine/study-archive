import { AlertTrigger } from '../components/AlertUI';
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-black mb-12 text-slate-800">2026 알림 시스템 테스트</h1>
      <AlertTrigger />
      <p className="mt-8 text-slate-400 font-medium">버튼을 눌러 나만의 독립된 알림을 확인하세요!</p>
    </main>
  );
}