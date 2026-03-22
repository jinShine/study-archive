export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 shadow-2xl rounded-3xl p-10 border border-slate-100 dark:border-slate-800">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
          🤖 AI 에이전트 통제 센터
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          이곳은 백엔드 API 서버의 관제소입니다. <br/>
          아래 엔드포인트를 통해 데이터를 제어하세요.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">GET Method</span>
            <p className="font-mono text-sm mt-1 text-slate-700 dark:text-slate-300">/api/agents</p>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">POST Method</span>
            <p className="font-mono text-sm mt-1 text-slate-700 dark:text-slate-300">/api/agents</p>
          </div>
        </div>

        <div className="mt-10 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-xl">
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            💡 Postman이나 Thunder Client를 사용하여 <br/>
            실제 API 타격 테스트를 진행해 보세요!
          </p>
        </div>
      </div>
    </div>
  );
}
