import LikeButton from './_components/LikeButton';

export default function HomePage() {
  return (
    <div className="p-10 max-w-4xl mx-auto space-y-12">
      <section className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-2xl">
        <h2 className="text-4xl font-black mb-4 tracking-tight">Server Component Area</h2>
        <p className="text-slate-400 leading-relaxed text-lg">
          이 영역은 서버에서 요리되어 HTML로 배달되었습니다. <br/>
          자바스크립트 번들이 포함되지 않아 매우 빠르고 가볍습니다.
        </p>
      </section>

      <section className="p-12 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Interactive Area</h2>
        {/* 클라이언트 컴포넌트 주입 */}
        <LikeButton />
      </section>
    </div>
  );
}
