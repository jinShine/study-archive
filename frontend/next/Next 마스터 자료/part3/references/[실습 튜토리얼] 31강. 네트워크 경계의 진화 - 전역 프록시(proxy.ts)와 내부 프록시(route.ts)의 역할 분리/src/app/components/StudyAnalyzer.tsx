'use client';
import { useState } from 'react';

export default function StudyAnalyzer() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const analyzeData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/proxy/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyHours: 5, subject: 'Next.js 보안' }),
      });
      const resData = await response.json();
      setResult(JSON.stringify(resData.data, null, 2));
    } catch (error) {
      setResult("통신 에러");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-gray-50 border rounded text-left w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">AI 분석기 (BFF 아키텍처)</h2>
      <button onClick={analyzeData} disabled={loading} className="w-full bg-slate-800 text-white font-bold p-3 rounded hover:bg-slate-700 disabled:opacity-50">
        {loading ? '수석 셰프가 요리 중...' : '수석 셰프(내부 프록시)에게 분석 요청'}
      </button>
      {result && <pre className="mt-4 p-4 bg-slate-800 text-blue-300 rounded text-sm overflow-x-auto">{result}</pre>}
    </div>
  );
}
