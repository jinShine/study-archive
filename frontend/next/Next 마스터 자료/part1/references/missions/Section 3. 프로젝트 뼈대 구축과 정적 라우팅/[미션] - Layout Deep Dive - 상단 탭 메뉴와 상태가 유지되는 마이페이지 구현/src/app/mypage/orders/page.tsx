export default function OrdersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">내 주문 내역</h2>
      <ul className="space-y-4">
        <li className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
          <div>
            <p className="font-semibold">기계식 키보드 청축</p>
            <p className="text-sm text-gray-500">2023.10.25 결제</p>
          </div>
          <span className="text-green-600 font-bold text-sm bg-green-100 px-3 py-1 rounded-full">배송 완료</span>
        </li>
        <li className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
          <div>
            <p className="font-semibold">무선 게이밍 마우스</p>
            <p className="text-sm text-gray-500">2023.11.02 결제</p>
          </div>
          <span className="text-blue-600 font-bold text-sm bg-blue-100 px-3 py-1 rounded-full">배송 중</span>
        </li>
      </ul>
    </div>
  );
}
