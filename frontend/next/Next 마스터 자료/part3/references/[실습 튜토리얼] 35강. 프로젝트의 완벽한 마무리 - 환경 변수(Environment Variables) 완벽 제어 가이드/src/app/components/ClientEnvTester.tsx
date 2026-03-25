'use client';
export default function ClientEnvTester() {
  const secret = process.env.SUPER_SECRET_DB_PASSWORD;
  const publicApi = process.env.NEXT_PUBLIC_API_URL;
  const expandedUrl = process.env.NEXT_PUBLIC_FULL_URL;
  const dynamicKey = 'NEXT_PUBLIC_API_URL';
  const dynamicLookup = process.env[dynamicKey];

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-md w-full">
      <h2 className="text-2xl font-black mb-4 text-blue-600">🌐 클라이언트 (브라우저 방)</h2>
      <ul className="space-y-4 text-slate-700">
        <li className="p-3 bg-red-50 rounded border border-red-200">
          <p className="font-bold text-red-700">1. 기밀 DB 비밀번호 (접두사 없음)</p>
          <code className="text-sm block mt-1">{secret ? secret : "undefined (유리벽에 막힘!)"}</code>
        </li>
        <li className="p-3 bg-blue-50 rounded border border-blue-200">
          <p className="font-bold text-blue-700">2. 공용 API URL (NEXT_PUBLIC_)</p>
          <code className="text-sm block mt-1">{publicApi}</code>
        </li>
        <li className="p-3 bg-blue-50 rounded border border-blue-200">
          <p className="font-bold text-blue-700">3. 동적 확장 URL ($ 기호 적용)</p>
          <code className="text-sm block mt-1">{expandedUrl}</code>
        </li>
        <li className="p-3 bg-amber-50 rounded border border-amber-200">
          <p className="font-bold text-amber-700">4. 동적 변수 조회 (process.env[key])</p>
          <code className="text-sm block mt-1">{dynamicLookup ? dynamicLookup : "undefined (빨간펜 치환 실패!)"}</code>
        </li>
      </ul>
    </div>
  );
}
