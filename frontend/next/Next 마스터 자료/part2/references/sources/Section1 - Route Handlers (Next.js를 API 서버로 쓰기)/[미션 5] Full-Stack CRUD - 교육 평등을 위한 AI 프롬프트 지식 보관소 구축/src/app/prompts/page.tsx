"use client";
/* =========================================================
 * [8] 클라이언트 컴포넌트 선언 (Client Boundary)
 * =========================================================
 * 파일 최상단에 이 마법의 지시어를 선언하는 순간, 이 컴포넌트는 브라우저로 전송되어
 * onClick, onSubmit 같은 사용자의 상호작용 이벤트와 useState 같은 렌더링 상태를 관리하게 됩니다.
 */

import { useState, useEffect } from "react";
import type { Prompt } from "@/lib/db";

export default function PromptsDashboard() {
  // [상태 관리] React가 브라우저 화면을 다시 그리게(Re-render) 만드는 트리거 메모리들입니다.
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // ===============================================
  // 🟢 [READ] 전체 데이터 가져오기 로직
  // ===============================================
  const fetchPrompts = async () => {
    // 우리가 만든 GET /api/prompts 라우트 핸들러를 조용히 타격합니다.
    const res = await fetch("/api/prompts");
    const data = await res.json();
    setPrompts(data); // 응답받은 데이터로 화면 상태를 갱신합니다.
  };

  // 컴포넌트가 브라우저에 최초로 나타날 때(Mount) 딱 1번만 데이터를 당겨옵니다.
  useEffect(() => { fetchPrompts(); }, []);

  // ===============================================
  // 🟢 [CREATE & UPDATE] 폼 전송 가로채기
  // ===============================================
  const handleSubmit = async (e: React.FormEvent) => {
    // 중요: 폼의 기본 동작인 '화면 전체 새로고침'을 완벽하게 차단합니다. (SPA 경험의 핵심)
    e.preventDefault();

    if (editingId) {
      // 현재 수정 모드라면 PATCH 메서드로 동적 라우트를 타격합니다.
      await fetch(`/api/prompts/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }), // 자바스크립트 객체를 JSON 문자열로 변환하여 전송
      });
      setEditingId(null); // 수정 모드 해제
    } else {
      // 생성 모드라면 POST 메서드로 라우트를 타격합니다.
      await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
    }

    // 타격 성공 후, 입력 폼을 청소하고 서버의 최신 데이터를 다시 당겨와 화면을 갱신합니다.
    setTitle("");
    setContent("");
    fetchPrompts();
  };

  // ===============================================
  // 🟢 [DELETE] 삭제 로직
  // ===============================================
  const handleDelete = async (id: string) => {
    // 치명적인 조작 전 브라우저 내장 경고창으로 1차 방어막을 칩니다.
    if (!confirm("정말 이 프롬프트를 삭제하시겠습니까? (복구 불가)")) return;

    await fetch(`/api/prompts/${id}`, { method: "DELETE" });
    fetchPrompts(); // 삭제 성공 후 갱신
  };

  // ===============================================
  // 🟢 [UI 제어] 수정 버튼 클릭 시 폼 컨트롤
  // ===============================================
  const handleEditClick = (p: Prompt) => {
    setEditingId(p.id); // 타겟 ID를 상태에 저장하여 UPDATE 모드로 전환
    setTitle(p.title);  // 폼 입력창에 기존 데이터 채워 넣기
    setContent(p.content);
  };

  // ===============================================
  // 🎨 화면 렌더링 (JSX)
  // ===============================================
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-black text-slate-800">📚 교육용 AI 프롬프트 지식 보관소</h1>

        {/* --- [제어 영역: 입력 폼] --- */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
          <h2 className="text-xl font-bold mb-4 text-slate-800">
            {editingId ? "✏️ 프롬프트 수정" : "✨ 새 프롬프트 등록"}
          </h2>
          <div className="space-y-4">
            <input
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              placeholder="프롬프트 제목 (예: 파이썬 알고리즘 튜터)"
              value={title} onChange={(e) => setTitle(e.target.value)} required
            />
            <textarea
              className="w-full p-3 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
              placeholder="학생의 눈높이에 맞춘 프롬프트 지시 내용을 명확하게 작성해 주세요."
              value={content} onChange={(e) => setContent(e.target.value)} required
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition cursor-pointer">
                {editingId ? "데이터 업데이트 완료" : "프롬프트 저장"}
              </button>
              {/* 수정 중일 때만 렌더링되는 취소 버튼 */}
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setTitle(""); setContent(""); }}
                  className="px-6 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition cursor-pointer">
                  취소
                </button>
              )}
            </div>
          </div>
        </form>

        {/* --- [출력 영역: 프롬프트 리스트] --- */}
        <div className="space-y-4">
          {prompts.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between gap-4 hover:shadow-md transition">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-2">{p.title}</h3>
                <p className="text-slate-600 mb-3 whitespace-pre-wrap">{p.content}</p>
                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
                  최근 갱신: {new Date(p.updatedAt).toLocaleString()}
                </span>
              </div>

              {/* 타격 버튼 그룹 */}
              <div className="flex sm:flex-col gap-2 justify-center">
                <button onClick={() => handleEditClick(p)} className="px-5 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition cursor-pointer">
                  수정
                </button>
                <button onClick={() => handleDelete(p.id)} className="px-5 py-2 bg-rose-50 text-rose-600 font-bold rounded-lg hover:bg-rose-100 transition cursor-pointer">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}