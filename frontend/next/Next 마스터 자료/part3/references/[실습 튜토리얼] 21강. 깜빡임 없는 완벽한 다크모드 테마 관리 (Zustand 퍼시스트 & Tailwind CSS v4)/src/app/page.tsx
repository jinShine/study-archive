import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Zustand 다크모드 완벽 동기화</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          새로고침을 하거나 창을 닫아도 설정이 유지됩니다.<br/>
          깜빡임 없는(FOUC 방지) 완벽한 다크모드를 테스트해 보세요!
        </p>
      </div>
      
      <ThemeToggle />
      
      <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-md text-center shadow-sm">
        <h3 className="text-xl font-semibold mb-2">실무 적용 포인트</h3>
        <ul className="text-sm text-left list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1 mt-4">
          <li>로컬 스토리지 데이터 안전한 Rehydration</li>
          <li>수동 DOM 업데이트로 렌더링 성능 최적화</li>
          <li>suppressHydrationWarning 속성 활용</li>
        </ul>
      </div>
    </main>
  );
}
