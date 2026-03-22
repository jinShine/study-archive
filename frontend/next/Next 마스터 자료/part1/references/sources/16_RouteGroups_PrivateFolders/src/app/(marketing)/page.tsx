export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter">최고의 서비스를 경험하세요</h1>
      <p className="text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
        이 페이지는 <code className="bg-slate-100 px-2 py-1 rounded text-pink-600">(marketing)/page.tsx</code>에서 렌더링되지만,<br/> 
        주소창에는 괄호 없이 깔끔하게 <strong className="text-slate-900">/</strong> 로 표시됩니다.
      </p>
    </div>
  );
}
