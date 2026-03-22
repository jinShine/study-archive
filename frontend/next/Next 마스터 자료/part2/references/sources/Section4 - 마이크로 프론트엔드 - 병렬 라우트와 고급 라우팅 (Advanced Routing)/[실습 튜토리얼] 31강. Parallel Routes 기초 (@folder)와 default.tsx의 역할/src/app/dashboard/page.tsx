export default function DashboardMain() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">메인 콘텐츠 (children)</h2>
      <p className="text-gray-600 leading-relaxed">
        이곳은 대시보드의 중앙 허브입니다. 좌측이나 상단에 넓게 배치되며, 
        우측의 병렬 슬롯들과 완전히 독립적인 생명주기를 가집니다.
      </p>
    </div>
  );
}