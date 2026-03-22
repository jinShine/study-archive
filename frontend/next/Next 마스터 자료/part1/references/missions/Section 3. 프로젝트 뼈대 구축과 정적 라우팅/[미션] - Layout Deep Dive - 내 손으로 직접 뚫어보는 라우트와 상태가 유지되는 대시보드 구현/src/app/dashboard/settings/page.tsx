export default function SettingsPage() {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border-l-8 border-emerald-500">
      <h2 className="text-3xl font-bold mb-4">⚙️ 환경 설정</h2>
      <p className="text-gray-600 mb-8">
        여기는 설정 페이지입니다. <br/>
        레이아웃은 그대로 유지된 채, 오직 이 흰색 영역만 교체되었습니다.
      </p>

      <div className="space-y-4 max-w-md">
        <label className="flex items-center space-x-3 p-4 border rounded cursor-pointer hover:bg-gray-50">
           <input type="checkbox" className="w-5 h-5 text-emerald-600" defaultChecked />
           <span>이메일 알림 받기</span>
        </label>
      </div>
    </div>
  );
}
