import Link from "next/link";
import React from "react";
import SkillSearch from "@/components/SkillSearch";

const roadmapData = [
  { id: 1, name: "HTML & CSS 기초", path: ["frontend"], level: "beginner" },
  { id: 2, name: "React 펀더멘탈", path: ["frontend", "react"], level: "beginner" },
  { id: 3, name: "Next.js 앱 라우터", path: ["frontend", "react", "nextjs"], level: "advanced" },
  { id: 4, name: "Node.js 런타임", path: ["backend"], level: "beginner" },
  { id: 5, name: "Express 미들웨어", path: ["backend", "express"], level: "beginner" },
  { id: 6, name: "PostgreSQL 스키마 설계", path: ["backend", "database"], level: "advanced" },
  { id: 7, name: "React Query 상태 관리", path: ["frontend", "react", "hooks"], level: "advanced" },
  { id: 8, name: "Tailwind CSS 디자인", path: ["frontend", "css"], level: "beginner" },
  { id: 9, name: "Docker 컨테이너라이징", path: ["devops"], level: "advanced" },
  { id: 10, name: "TypeScript 정적 타입", path: ["frontend", "typescript"], level: "beginner" },
];

export default async function RoadmapPage({ params, searchParams }: any) {
  const { skill = [] } = await params;
  const resolvedSP = await searchParams;
  const query = typeof resolvedSP.q === 'string' ? resolvedSP.q : "";
  const levelFilter = typeof resolvedSP.level === 'string' ? resolvedSP.level : "";
  const currentPath = "/roadmap" + (skill.length > 0 ? "/" + skill.join("/") : "");

  let filteredSkills = [...roadmapData];
  if (skill.length > 0) filteredSkills = filteredSkills.filter((i) => skill.every((f, idx) => i.path[idx] === f));
  if (query) filteredSkills = filteredSkills.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
  if (levelFilter) filteredSkills = filteredSkills.filter((s) => s.level === levelFilter);

  return (
    <div className="p-10 max-w-6xl mx-auto font-sans bg-white text-slate-900 min-h-screen">
      <h1 className="text-4xl font-black mb-10 tracking-tight">DEV ROADMAP</h1>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
        <SkillSearch initialQuery={query} actionPath={currentPath} />
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200">
          {[{l:'전체',v:''},{l:'입문',v:'beginner'},{l:'심화',v:'advanced'}].map(i => (
            <Link key={i.l} href={{ pathname: currentPath, query: { q: query, level: i.v || undefined } }} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${levelFilter === i.v ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600'}`}>{i.l}</Link>
          ))}
        </div>
      </div>
      <section className="mb-12">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
          <p className="text-blue-400 font-mono mb-2 uppercase tracking-widest text-xs">Current Path</p>
          <h2 className="text-3xl font-bold">{skill.length > 0 ? `🎯 ${skill.join(" > ").toUpperCase()}` : "🎯 ROOT ROADMAP"}</h2>
        </div>
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredSkills.map(item => (
          <div key={item.id} className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition">
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase mb-4 ${item.level === 'beginner' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>{item.level}</span>
            <h3 className="text-xl font-bold mb-4">{item.name}</h3>
            <div className="text-xs text-slate-400 font-mono">/roadmap/{item.path.join("/")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
