interface NotificationData { events: { sender: { login: string; avatar_url: string }; repository: { full_name: string }; starred_at: string; }[]; updatedAt: string; }
export default async function NotificationsPage() {
  const response = await fetch("http://localhost:3000/api/webhooks/stars", { cache: "no-store" });
  const data: NotificationData = await response.json();
  return (
    <div style={{ padding: "40px", maxWidth: "700px" }}>
      <h1 style={{ color: "var(--primary)" }}>실시간 GitHub 알림 피드</h1>
      <p style={{ color: "#94a3b8" }}>시스템 마지막 동기화: <strong>{new Date(data.updatedAt).toLocaleTimeString()}</strong></p><hr style={{ borderColor: "#1e293b", margin: "20px 0" }} />
      {data.events.length === 0 ? (
        <div style={{ padding: "20px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}><p>⏳ 알림이 없습니다.</p></div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.events.map((event, index) => (
            <li key={index} style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "15px", padding: "15px", backgroundColor: "#1e293b", borderRadius: "8px", border: "1px solid #334155" }}>
              <img src={event.sender.avatar_url || "https://github.com/identicons/nextjs.png"} alt="profile" style={{ width: "50px", height: "50px", borderRadius: "50%", border: "2px solid #475569" }} />
              <div><strong>{event.sender.login}</strong>님이 <span style={{ color: "var(--primary)", fontWeight: "bold" }}>{event.repository.full_name}</span>에 별을 눌렀습니다!<br /><small style={{ color: "#94a3b8" }}>{new Date(event.starred_at).toLocaleString()}</small></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}