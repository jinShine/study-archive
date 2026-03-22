'use client';
export default function ArtFrame({ children }: { children: React.ReactNode }) {
  return <div className="border-[12px] border-stone-900 p-10 bg-white shadow-2xl hover:scale-[1.02] transition-transform">{children}</div>;
}
