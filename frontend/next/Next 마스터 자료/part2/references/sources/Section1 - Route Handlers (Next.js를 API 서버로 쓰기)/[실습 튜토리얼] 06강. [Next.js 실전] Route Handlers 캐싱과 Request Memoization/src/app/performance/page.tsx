async function getNextjsStats() {
  const res = await fetch("https://api.github.com/repos/vercel/next.js", { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("데이터 수신 실패");
  return res.json();
}
export default async function PerformancePage() {
  const data1 = await getNextjsStats();
  const data2 = await getNextjsStats();
  return (
    <main style={{ padding: "40px" }}><h1 style={{ color: "#f59e0b" }}>Request Memoization 통제 완료</h1>
    <hr style={{ borderColor: "#1e293b", margin: "20px 0" }} />
    <p><strong>Repository:</strong> {data1.full_name}</p><p><strong>Stars:</strong> {data1.stargazers_count}</p>
    <p><strong>isIdentical:</strong> {String(data1.id === data2.id)}</p></main>
  );
}