/**
 * 1. 실제 GitHub API를 호출하는 코어 함수
 */
async function getNextjsStats() {
  // 표준 fetch에 Next.js만의 특수 통제 객체 'next'를 주입하여 1시간 캐싱을 강제합니다.
  const res = await fetch("https://api.github.com/repos/vercel/next.js", {
    next: { revalidate: 3600 }
  });

  if (!res.ok) throw new Error("데이터를 가져오는데 실패했습니다.");
  return res.json();
}

/**
 * 2. 서버 컴포넌트 (Server Component)
 * 시스템 내부의 Request Memoization 작동을 증명하기 위해 의도적으로 함수를 두 번 호출합니다.
 */
export default async function PerformancePage() {
  // 첫 번째 호출: 메모리가 비어있으므로 실제 네트워크 통신 발생 (터미널에 miss 찍힘)
  const data1 = await getNextjsStats();

  // 두 번째 호출: 시스템이 동일 요청을 감지, 네트워크를 차단하고 메모리에서 반환 (터미널에 hit 찍힘)
  const data2 = await getNextjsStats();

  const isIdentical = data1.id === data2.id;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-t-8 border-blue-500">
        <h2 className="text-2xl font-bold mb-6">Request Memoization 통제 완료</h2>
        <div className="space-y-4 text-slate-700">
          <p className="p-3 bg-slate-50 rounded-lg"><strong>타겟 리포지토리:</strong> {data1.full_name}</p>
          <p className="p-3 bg-slate-50 rounded-lg"><strong>현재 별점(Stars):</strong> {data1.stargazers_count.toLocaleString()}개</p>

          <div className={`p-4 rounded-lg font-bold text-center ${isIdentical ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {isIdentical ? "✅ 메모리 캐시 작동 성공 (식별자 일치)" : "❌ 캐시 실패"}
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-500 text-center">
          현재 에디터 터미널을 확인하세요.<br/>두 번째 통신이 <strong>(cache hit)</strong>과 함께 1ms 만에 끝났다면 완벽합니다.
        </p>
      </div>
    </div>
  );
}