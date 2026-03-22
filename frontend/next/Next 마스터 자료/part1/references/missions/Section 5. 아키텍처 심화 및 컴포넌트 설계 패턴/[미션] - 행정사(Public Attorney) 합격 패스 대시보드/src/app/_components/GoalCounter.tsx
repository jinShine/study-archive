'use client';
import { useState } from 'react';
export default function GoalCounter() {
  const [cnt, setCnt] = useState(0);
  return <div className="p-6 bg-indigo-50 border-l-4 border-indigo-600 mb-8"><p className="font-bold">목표 카운터: {cnt}문제</p><button onClick={() => setCnt(cnt+5)} className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded font-bold">+5문제 추가</button></div>;
}
