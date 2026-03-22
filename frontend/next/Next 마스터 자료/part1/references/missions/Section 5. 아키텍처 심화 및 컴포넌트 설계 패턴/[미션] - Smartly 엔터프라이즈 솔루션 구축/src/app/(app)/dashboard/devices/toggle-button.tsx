"use client";
import { useState } from "react";
export default function DevicePowerToggle({ name }: { name: string }) {
  const [isOn, setIsOn] = useState(false);
  return (
    <button
      onClick={() => setIsOn(!isOn)}
      className={`p-12 rounded-full font-black text-2xl transition-all ${isOn ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}
    >
      {isOn ? "ON" : "OFF"}
    </button>
  );
}
