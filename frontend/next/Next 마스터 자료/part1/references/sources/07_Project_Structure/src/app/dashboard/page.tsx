import Chart from './Chart'; // [Colocation 확인] 같은 폴더 내의 부품 파일을 가져옵니다.

/**
 * DashboardPage: /dashboard 경로의 UI
 */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-black text-slate-900">대시보드 메인 페이지</h2>
        <p className="text-slate-400 font-medium">src/app/dashboard/page.tsx</p>
      </header>
      
      {/* [강의 핵심: 위치 병합(Colocation)]
        동일한 폴더 내에 있는 Chart.tsx를 임포트하여 화면에 그립니다.
        사용자가 /dashboard/Chart로 접속하면 404 에러가 나지만, 
        여기서 부품으로 사용하는 것은 아무런 문제가 없습니다.
      */}
      <section className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold mb-6 text-slate-700">실시간 데이터 부품</h3>
        <Chart />
      </section>

      <div className="p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
        <h4 className="font-bold text-amber-800 mb-2 font-mono">⚠️ Colocation 보안 테스트</h4>
        <p className="text-amber-700 text-sm leading-relaxed italic">
          "브라우저 주소창에 <strong>localhost:3000/dashboard/Chart</strong>를 입력해보세요."<br/>
          Next.js는 이름이 page가 아니면 절대 문을 열어주지 않습니다.
        </p>
      </div>
    </div>
  );
}
