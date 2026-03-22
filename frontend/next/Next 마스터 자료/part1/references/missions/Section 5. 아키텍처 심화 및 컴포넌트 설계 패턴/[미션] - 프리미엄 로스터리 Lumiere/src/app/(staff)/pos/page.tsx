import { formatCurrency } from "../../_utils/currency";
// URL: localhost:3000/pos
export default function Page() {
  return <div>
    <h1 className="text-4xl font-black mb-6">주문 현황</h1>
    {/* Private Folder의 함수 사용 */}
    <p className="text-2xl font-bold text-slate-600">오늘의 매출: {formatCurrency(1245000)}</p>
  </div>;
}
