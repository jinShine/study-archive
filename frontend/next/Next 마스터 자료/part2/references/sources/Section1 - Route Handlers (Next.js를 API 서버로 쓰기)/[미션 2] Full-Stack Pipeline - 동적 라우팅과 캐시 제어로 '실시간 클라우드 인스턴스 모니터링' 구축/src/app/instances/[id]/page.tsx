interface InstanceData {
  id: string;
  status: string;
  cpuUsage: number;
  timestamp: string;
  log: string;
}

export default async function InstancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // API 타격 (캐시 무효화)
  const res = await fetch(`http://localhost:3000/api/instances/${id}`, {
    cache: "no-store",
  });
  const data: InstanceData = await res.json();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">인스턴스 리포트</h2>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold animate-pulse">
            LIVE
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-500 mb-1">식별 코드</p>
            <p className="text-lg font-mono font-bold text-blue-600">{data.id}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-sm text-gray-500 mb-1">CPU 점유율</p>
              <p className="text-xl font-black">{data.cpuUsage}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-sm text-gray-500 mb-1">상태</p>
              <p className="text-xl font-black text-emerald-600">{data.status}</p>
            </div>
          </div>

          <div className="p-4 border-l-4 border-gray-300 bg-gray-50">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1">System Log</p>
            <p className="text-sm text-gray-700 italic">"{data.log}"</p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-gray-400">
          Last Check: {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
