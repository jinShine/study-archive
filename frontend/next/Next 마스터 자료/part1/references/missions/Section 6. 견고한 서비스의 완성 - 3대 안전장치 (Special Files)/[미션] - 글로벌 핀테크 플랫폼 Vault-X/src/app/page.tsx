import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* 핵심 가치 전달: 타이포그래피 강조 */}
      <h1 className="text-6xl font-black tracking-tight mb-6 text-slate-900">
        자산 관리의 <br /> <span className="text-emerald-600">새로운 패러다임</span>
      </h1>
      <p className="text-slate-500 mb-12 max-w-md mx-auto font-medium leading-relaxed">
        Vault-X는 어떤 시스템 장애 속에서도 당신의 자산 데이터를 안전하게 보호하고 복구합니다.
      </p>
      {/* 대시보드로 이동하는 메인 버튼: 사용자 시선을 끄는 스타일링 */}
      <Link href="/dashboard" className="bg-emerald-600 text-white px-10 py-4 rounded-full font-black shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 transition-all">
        대시보드 접속 (에러 테스트)
      </Link>
    </div>
  );
}