'use client';
import { useState } from 'react';
export default function BookmarkButton() {
  const [saved, setSaved] = useState(false);
  return <button onClick={() => setSaved(!saved)} className={`px-4 py-2 font-bold rounded-lg ${saved ? 'bg-emerald-100 text-emerald-700' : 'bg-white border'}`}>{saved ? '★ 저장됨' : '☆ 중요 법령 저장'}</button>;
}
