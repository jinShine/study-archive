/**
 * Chart Component: 오직 대시보드 내부에서만 사용되는 전용 부품입니다.
 * - 별도의 components 폴더로 멀리 보낼 필요 없이, 사용하는 곳 옆에 두어 관리 효율을 높입니다.
 */
export default function Chart() {
  return (
    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
      <div className="flex items-end justify-center gap-3 h-24 mb-6">
        <div className="w-10 bg-slate-200 h-1/2 rounded-t-lg"></div>
        <div className="w-10 bg-orange-300 h-3/4 rounded-t-lg animate-bounce"></div>
        <div className="w-10 bg-orange-500 h-full rounded-t-lg"></div>
      </div>
      <p className="text-slate-400 font-bold text-sm">
        이곳은 Chart.tsx 내부입니다. <br/>
        <span className="text-orange-400">/dashboard/Chart</span> 주소로는 저를 만날 수 없어요!
      </p>
    </div>
  );
}
