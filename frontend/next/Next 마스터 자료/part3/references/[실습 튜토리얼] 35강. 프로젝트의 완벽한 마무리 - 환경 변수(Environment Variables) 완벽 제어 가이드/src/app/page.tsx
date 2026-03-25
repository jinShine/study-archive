import ClientEnvTester from './components/ClientEnvTester';
import { connection } from 'next/server';

export default async function Home() {
  await connection();
  const secretDbPass = process.env.SUPER_SECRET_DB_PASSWORD;
  const publicApi = process.env.NEXT_PUBLIC_API_URL;

  return (
    <main className="flex flex-col gap-8 w-full max-w-4xl">
      <h1 className="text-4xl font-extrabold text-center text-slate-800">환경 변수(Env Vars) 제어소</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl shadow-xl w-full">
          <h2 className="text-2xl font-black mb-4 text-white">🖥️ 서버 (Node.js 금고)</h2>
          <ul className="space-y-4 text-slate-300">
            <li className="p-3 bg-slate-700 rounded border border-slate-600">
              <p className="font-bold text-red-400">1. 기밀 DB 비밀번호 (접두사 없음)</p>
              <code className="text-sm block mt-1 text-white">{secretDbPass}</code>
              <p className="text-xs mt-2 text-slate-400">※ 런타임에 금고에서 정상적으로 꺼내왔습니다.</p>
            </li>
            <li className="p-3 bg-slate-700 rounded border border-slate-600">
              <p className="font-bold text-blue-400">2. 공용 API URL (NEXT_PUBLIC_)</p>
              <code className="text-sm block mt-1 text-white">{publicApi}</code>
            </li>
          </ul>
        </div>
        <ClientEnvTester />
      </div>
    </main>
  );
}
