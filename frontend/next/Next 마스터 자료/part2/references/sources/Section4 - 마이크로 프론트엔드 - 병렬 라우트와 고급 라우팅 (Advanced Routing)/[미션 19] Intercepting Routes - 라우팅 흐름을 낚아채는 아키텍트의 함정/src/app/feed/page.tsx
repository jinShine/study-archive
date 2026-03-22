import Link from 'next/link';

const mentors = [
  { id: 'ARCH_01', name: '시스템 아키텍트', field: '프론트엔드 최적화' },
  { id: 'DATA_02', name: '데이터 엔지니어', field: '대규모 분산 처리' },
];

export default function FeedPage() {
  return (
    <div className="p-10 bg-slate-50 min-h-screen font-sans">
      <h1 className="text-4xl font-black mb-8 text-slate-900 tracking-tighter">🌐 코라파덕 글로벌 멘토 피드</h1>
      <p className="text-slate-500 mb-8 font-medium">멘토 프로필을 클릭하여 라우팅 흐름이 어떻게 낚아채어지는지 확인하십시오.</p>

      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        {mentors.map((mentor) => (
          <div key={mentor.id} className="p-8 border border-slate-200 rounded-3xl shadow-sm bg-white hover:shadow-md transition-all">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{mentor.name}</h3>
            <p className="text-indigo-600 font-bold mb-6">{mentor.field}</p>
            <Link
              href={`/mentor/${mentor.id}`}
              className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors active:scale-95"
            >
              프로필 상세보기
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}