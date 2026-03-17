import React, { useId, useState } from 'react';

export default function ManualA11yLab() {
  const [error, setError] = useState<string | null>(null);

  // 💡 인풋과 에러 메시지를 연결하기 위한 수동 ID 생성
  const inputId = useId();
  const errorId = useId();

  return (
    <div className="p-10 max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 font-sans">
      <h1 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">A11y Pain Lab</h1>

      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          {/* 1. 레이블과 인풋 연결 */}
          <label htmlFor={inputId} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">
            Email Address
          </label>

          <input
            id={inputId}
            type="email"
            // 2. 에러 유무에 따른 접근성 상태 수동 바인딩 (이 부분이 유지보수의 지옥입니다)
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : undefined}
            className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none transition-all ${error ? 'border-rose-500 bg-rose-50' : 'border-transparent focus:border-indigo-500'}`}
            placeholder="수동 ID 연결을 확인하세요"
          />

          {/* 3. 에러 메시지 렌더링 및 ID 부여 */}
          {error && (
            <p id={errorId} role="alert" className="text-rose-500 text-xs font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}
        </div>

        <button
          onClick={() => setError(error ? null : "올바른 이메일 형식이 아닙니다.")}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95"
        >
          {error ? "에러 제거" : "에러 발생 시뮬레이션"}
        </button>
      </div>

      <div className="mt-8 p-5 bg-indigo-50 rounded-2xl text-[10px] text-indigo-700 leading-relaxed">
        <b>💡 아키텍트의 테스트 포인트:</b><br/>
        1. 브라우저 개발자 도구의 'Accessibility' 탭을 켭니다.<br/>
        2. 인풋 선택 시 <b>aria-describedby</b>가 에러 ID를 정확히 참조하는지 보세요.<br/>
        3. 필드가 100개일 때 이 작업을 오타 없이 수행할 수 있을지 자문해 보세요.
      </div>
    </div>
  );
}