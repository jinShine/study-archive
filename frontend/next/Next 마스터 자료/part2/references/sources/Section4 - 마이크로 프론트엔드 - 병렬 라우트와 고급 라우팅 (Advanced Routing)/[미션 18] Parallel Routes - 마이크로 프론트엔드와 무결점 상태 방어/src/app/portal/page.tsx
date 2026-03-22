export default function PortalMainPage() {
  return (
    <div className="h-full flex flex-col justify-center items-center text-center p-10 bg-indigo-50/50 rounded-3xl border-2 border-dashed border-indigo-200">
      <h2 className="text-3xl font-black text-indigo-900 mb-4">학습 대시보드 메인</h2>
      <p className="text-indigo-700 font-medium leading-relaxed">
        이 영역은 기본 라우팅(/portal)에 매칭되는 children 슬롯입니다.
        <br />
        좌우의 컴포넌트들과 완전히 독립된 생명주기를 가집니다.
      </p>
    </div>
  );
}