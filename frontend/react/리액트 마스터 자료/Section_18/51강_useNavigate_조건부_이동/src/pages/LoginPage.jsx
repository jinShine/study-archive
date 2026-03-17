import { useNavigate } from 'react-router';
export default function LoginPage() {
  const navigate = useNavigate();
  const handleLogin = async () => {
    console.log("로그인 프로세스 시작...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate('/', { replace: true });
    alert("인증에 성공하였습니다.");
  };
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>LOGIN PAGE</h2>
      <button onClick={handleLogin} style={{ padding: '15px 30px', cursor: 'pointer' }}>
        LOGIN TO DASHBOARD
      </button>
    </div>
  );
}