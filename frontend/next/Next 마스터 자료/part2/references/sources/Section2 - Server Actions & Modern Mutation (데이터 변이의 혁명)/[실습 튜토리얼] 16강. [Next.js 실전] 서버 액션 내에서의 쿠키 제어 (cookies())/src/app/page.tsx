import ThemeToggleButton from './components/ThemeToggleButton';

export default function HomePage() {
  return (
    <div className="text-center max-w-2xl">
      <h1 className="text-4xl font-extrabold mb-6">보안 쿠키 통제소</h1>
      <p className="text-xl mb-10 opacity-80 leading-relaxed">
        클라이언트의 자바스크립트가 아닌, 안전한 백엔드 서버 액션을 통해 <br/>HttpOnly 쿠키를 굽고 테마를 전환하는 마법을 시연합니다.
      </p>
      <div className="flex justify-center"><ThemeToggleButton /></div>
    </div>
  );
}