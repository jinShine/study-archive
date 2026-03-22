import FocusModeButton from './components/FocusModeButton';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const cookieStore = await cookies();
  const currentMode = cookieStore.get('learningMode')?.value || 'standard';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 max-w-3xl mx-auto">
      <div className="w-full bg-white shadow-2xl rounded-[2rem] p-12 text-center border border-slate-100">
        <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">
          🦆 Korapaduck Edu
        </h1>
        <p className="text-slate-600 mb-10 font-medium">
          기술을 통한 교육적 평등은 큰 비전에서 시작하지만, 작은 문제를 게임처럼 해결해 나가는 유연한 접근법에서 비로소 완성됩니다. 자신에게 맞는 학습 환경을 선택하십시오.
        </p>
        
        <div className="flex justify-center">
          <FocusModeButton currentMode={currentMode} />
        </div>

        <hr className="my-10 border-slate-100" />
        
        <div className="text-left space-y-6">
          <h3 className="font-bold text-slate-800">📚 오늘의 학습 아티클</h3>
          <p className="text-slate-700">
            소프트웨어 공학에서 접근성(Accessibility)은 선택이 아닌 필수입니다. 완벽한 아키텍처란 단순히 서버가 빠르고 코드가 깔끔한 것을 넘어, 스크린 너머의 모든 사용자가 어떠한 장벽도 없이 정보에 닿을 수 있도록 설계하는 것을 의미합니다.
          </p>
          <p className="text-slate-700">
            우리는 오늘 쿠키(Cookies)라는 고전적인 기술에 HttpOnly라는 강력한 현대적 방패를 덧대고, React의 동시성 엔진을 활용하여 브라우저의 렌더링 병목을 없앴습니다. 이 모든 복잡한 기술의 최종 목적은 단 하나, 학생의 학습 흐름이 단 1초라도 끊기지 않게 보호하는 것입니다.
          </p>
        </div>
      </div>
    </div>
  );
}