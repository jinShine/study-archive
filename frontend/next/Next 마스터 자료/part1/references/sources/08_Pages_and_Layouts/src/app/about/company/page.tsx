export default function CompanyPage() {
  return (
    <div className="py-10">
      <div className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-md text-xs font-bold mb-3">
        Nested Route
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">우리 회사를 소개합니다.</h3>
      <p className="text-slate-500">이곳은 <code className="bg-slate-200 px-1 rounded">/about/company</code> 경로입니다.</p>
      
      <div className="mt-8 p-4 bg-white border rounded-lg text-sm shadow-sm">
        💡 <strong>레이아웃 샌드위치 확인:</strong><br/>
        1. 최상위 Root Layout (흰색 헤더)<br/>
        2. About Layout (파란색 테두리)<br/>
        3. Company Page (지금 보고 계신 빨간 텍스트 내용)
      </div>
    </div>
  );
}
