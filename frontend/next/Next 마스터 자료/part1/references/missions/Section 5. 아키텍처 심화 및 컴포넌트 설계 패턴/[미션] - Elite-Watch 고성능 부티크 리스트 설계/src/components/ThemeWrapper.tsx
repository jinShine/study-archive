'use client';
import { useState } from 'react';
export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  return (
    <div className={`min-h-screen p-20 transition-all duration-700 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="flex justify-between mb-20 items-center">
        <h1 className="text-4xl font-black italic">ELITE WATCH</h1>
        <button onClick={() => setIsDark(!isDark)} className="p-3 border-2 border-current font-bold uppercase text-xs">Toggle Theme</button>
      </div>
      {children}
    </div>
  );
}
