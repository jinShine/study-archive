'use client';
export default function GlobalError({ error, reset }: any) {
  return (
    <html>
      <body className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h2 className="text-4xl font-black mb-8 text-red-500">CRITICAL SYSTEM ERROR</h2>
        <button onClick={() => reset()} className="bg-white text-black px-8 py-3 rounded-full font-bold">REBOOT APP</button>
      </body>
    </html>
  );
}
