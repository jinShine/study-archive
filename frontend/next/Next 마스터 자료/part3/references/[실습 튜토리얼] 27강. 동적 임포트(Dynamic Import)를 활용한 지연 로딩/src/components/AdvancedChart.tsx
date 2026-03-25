'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const data = [
  { name: '월', 학습시간: 2 }, { name: '화', 학습시간: 3.5 }, { name: '수', 학습시간: 1.5 },
  { name: '목', 학습시간: 4 }, { name: '금', 학습시간: 2.5 }, { name: '토', 학습시간: 5 }, { name: '일', 학습시간: 6 },
];
export default function AdvancedChart() {
  return (
    <div className="h-80 w-full bg-white p-4 border border-gray-200 rounded shadow-sm mt-8">
      <h3 className="text-lg font-bold mb-4 text-gray-800">주간 학습 통계 (Recharts)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" /><YAxis /><Tooltip />
          <Line type="monotone" dataKey="학습시간" stroke="#3b82f6" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
