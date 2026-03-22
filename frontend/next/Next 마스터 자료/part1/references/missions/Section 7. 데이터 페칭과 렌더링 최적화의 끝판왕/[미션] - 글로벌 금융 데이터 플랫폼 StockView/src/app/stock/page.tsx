export default async function Page() {
  // 5초 주기로 재검증
  const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul', {
    next: { revalidate: 5 }
  });
  const data = await res.json();
  const time = data.dateTime.split('T')[1].split('.')[0];

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-20 text-center">
      <h1 className="text-5xl font-black mb-10 text-emerald-400 italic">ISR 5S TEST</h1>
      <div className="p-16 border-4 border-emerald-500 rounded-[4rem] bg-emerald-500/5 shadow-2xl">
        <p className="text-slate-400 font-bold mb-4">CURRENT CACHED TIME</p>
        <p className="text-8xl font-mono font-black">{time}</p>
      </div>
      <p className="mt-12 text-slate-500 max-w-md font-medium">
        5초간은 새로고침해도 시간이 멈춰있습니다.<br/>
        5초 뒤 새로고침하면? 일단 멈춘 시간이 보이고,<br/>
        <strong className="text-white">한 번 더 새로고침해야</strong> 바뀐 시간이 보입니다!<br/>
        (이것이 Stale-While-Revalidate의 정수입니다.)
      </p>
    </div>
  );
}
