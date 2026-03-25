import { getUserFromDb } from '@/app/lib/db';

export default async function SecureBankPage() {
  const user = await getUserFromDb('1');
  return (
    <main className="p-10 w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-2xl text-center">
      <h1 className="text-2xl font-extrabold mb-4 text-blue-800">국민 보안 은행</h1>
      <p className="text-gray-600 font-bold mb-6">잔액: {user?.accountBalance}</p>
      <button className="w-full py-4 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition">
        전재산 해커에게 송금하기
      </button>
    </main>
  );
}
