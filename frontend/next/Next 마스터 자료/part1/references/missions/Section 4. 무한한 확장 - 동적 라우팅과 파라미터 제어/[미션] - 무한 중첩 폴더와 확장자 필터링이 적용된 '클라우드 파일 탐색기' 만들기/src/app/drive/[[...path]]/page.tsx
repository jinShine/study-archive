import Link from "next/link";
import React from "react";
import FileSearch from "@/components/FileSearch";

const fileSystem = [
  { id: 1, name: "2024_연봉계약서.pdf", path: ["documents", "work"], ext: "pdf", size: "1.2MB" },
  { id: 2, name: "프로젝트_기획안.pdf", path: ["documents", "work"], ext: "pdf", size: "3.5MB" },
  { id: 3, name: "휴가사진1.jpg", path: ["images", "2024"], ext: "image", size: "4.2MB" },
  { id: 4, name: "디자인_시안_최종.png", path: ["images"], ext: "image", size: "8.1MB" },
  { id: 5, name: "이력서_국문.pdf", path: [], ext: "pdf", size: "2.1MB" },
  { id: 6, name: "프로젝트_백업.zip", path: [], ext: "zip", size: "125MB" },
  { id: 7, name: "회의록_정리.docx", path: ["documents"], ext: "doc", size: "0.8MB" },
  { id: 8, name: "회사_로고_가로형.ai", path: ["images", "assets"], ext: "image", size: "2.4MB" },
  { id: 9, name: "영수증_모음.pdf", path: ["finance"], ext: "pdf", size: "5.5MB" },
  { id: 10, name: "기말고사_정리.docx", path: ["documents", "school"], ext: "doc", size: "2.3MB" },
];

export default async function DrivePage({ params, searchParams }: any) {
  const { path = [] } = await params;
  const resolvedSP = await searchParams;
  const query = typeof resolvedSP.q === 'string' ? resolvedSP.q : "";
  const extFilter = typeof resolvedSP.ext === 'string' ? resolvedSP.ext : "";
  const currentPath = "/drive" + (path.length > 0 ? "/" + path.join("/") : "");

  let currentFiles = [...fileSystem];
  if (path.length > 0) currentFiles = currentFiles.filter((f) => path.every((folder, idx) => f.path[idx] === folder));
  if (query) currentFiles = currentFiles.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));
  if (extFilter) currentFiles = currentFiles.filter((f) => f.ext === extFilter);

  const getIcon = (ext: string) => (ext === 'pdf' ? '📄' : ext === 'image' ? '🖼️' : ext === 'zip' ? '📦' : '📝');

  return (
    <div className="p-10 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-extrabold text-blue-600 mb-8 border-b pb-4">☁️ My Cloud Drive</h1>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
        <FileSearch initialQuery={query} actionPath={currentPath} />
        <div className="flex gap-2 text-black text-sm font-bold">
          <Link href={{ pathname: currentPath, query: { q: query } }} className={`px-4 py-2 border rounded-md transition ${!extFilter ? 'bg-blue-600 text-white shadow-md' : 'bg-white hover:bg-gray-100'}`}>전체</Link>
          <Link href={{ pathname: currentPath, query: { q: query, ext: 'pdf' } }} className={`px-4 py-2 border rounded-md transition ${extFilter === 'pdf' ? 'bg-blue-600 text-white shadow-md' : 'bg-white hover:bg-gray-100'}`}>PDF만</Link>
          <Link href={{ pathname: currentPath, query: { q: query, ext: 'image' } }} className={`px-4 py-2 border rounded-md transition ${extFilter === 'image' ? 'bg-blue-600 text-white shadow-md' : 'bg-white hover:bg-gray-100'}`}>이미지만</Link>
        </div>
      </div>
      <nav className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-700 overflow-x-auto whitespace-nowrap">
        <Link href="/drive" className="hover:text-blue-500">📂 내 드라이브</Link>
        {path.map((folder: string, index: number) => (
          <React.Fragment key={index}>
            <span className="text-gray-400">&gt;</span>
            <Link href={`/drive/${path.slice(0, index + 1).join("/")}`} className="hover:text-blue-500 capitalize bg-gray-100 px-3 py-1 rounded">📁 {folder}</Link>
          </React.Fragment>
        ))}
      </nav>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {currentFiles.map((file) => (
          <div key={file.id} className="p-6 border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-xl transition text-black text-center group cursor-pointer">
            <p className="text-5xl mb-4 group-hover:scale-110 transition-transform">{getIcon(file.ext)}</p>
            <p className="font-bold break-all leading-tight">{file.name}</p>
            <p className="text-xs text-gray-400 mt-2">{file.size}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
