import React from 'react';
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900">최고 관리자 대시보드</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {children}
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-100">
            {analytics}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-green-100">
            {team}
          </div>
        </div>
      </div>
    </div>
  );
}