export default function ProfilePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">내 프로필 정보</h2>
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-4xl">
          🧑‍💻
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">이름: 김개발</p>
          <p className="text-gray-500">이메일: dev.kim@example.com</p>
          <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-full">
            VIP 회원
          </span>
        </div>
      </div>
    </div>
  );
}
