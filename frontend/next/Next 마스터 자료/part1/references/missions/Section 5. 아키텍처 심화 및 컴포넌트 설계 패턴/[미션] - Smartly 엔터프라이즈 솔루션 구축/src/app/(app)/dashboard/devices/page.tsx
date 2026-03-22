import Link from "next/link";
import { MOCK_DEVICES } from "@/app/_lib/db";
export default async function DeviceListPage({ searchParams }: any) {
  const { q = "", cat = "" } = await searchParams;
  const filteredItems = MOCK_DEVICES.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-black">Devices</h2>
      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <Link key={item.id} href={`/dashboard/devices/${item.id}`} className="p-8 bg-white rounded-2xl shadow hover:shadow-xl transition block border">
            <h3 className="font-bold text-xl">{item.name}</h3>
            <p className="text-xs text-slate-400 mt-2">{item.id}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
