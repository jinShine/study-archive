import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

// [Next.js 15 핵심] 비동기 파라미터 타입 정의
interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function WikiPage({ params }: PageProps) {
  // 1. await를 사용하여 비동기 파라미터를 수신합니다.
  const { slug = [] } = await params;

  const pathDepth = slug.length;
  const title = pathDepth > 0 ? slug[slug.length - 1] : "Docs Home";

  // 2. 가상의 위키 데이터 로직
  const getContent = (topic: string) => {
    const data: Record<string, string> = {
      "react": "React는 사용자 인터페이스를 만들기 위한 선언적이고 효율적이며 유연한 JavaScript 라이브러리입니다.",
      "nextjs": "Next.js는 서버 사이드 렌더링, 정적 사이트 생성 등 풀스택 기능을 제공하는 React 프레임워크입니다.",
      "hooks": "Hooks는 리액트 16.8 버전부터 도입된 기능으로, 클래스 없이 상태와 생명주기를 관리하게 해줍니다.",
      "typescript": "TypeScript는 자바스크립트에 타입을 부여하여 코드의 안정성을 높여주는 언어입니다."
    };
    return data[topic];
  };

  const content = pathDepth > 0 
    ? getContent(slug[slug.length - 1]) 
    : "개발자 위키 엔진에 오신 것을 환영합니다. 왼쪽 메뉴나 아래 카테고리를 선택해 탐색을 시작하세요.";

  // [실무 팁] 없는 콘텐츠 요청 시 404 트리거
  if (pathDepth > 0 && !content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* --- Part 1: 동적 Breadcrumb 네비게이션 --- */}
        <nav className="flex items-center text-sm text-slate-500 mb-8 bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100">
          <Link href="/docs" className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
            DOCS
          </Link>

          {slug.map((segment, index) => {
            // 현재 단계까지의 경로를 누적하여 실제 이동 가능한 링크 생성
            const href = `/docs/${slug.slice(0, index + 1).join("/")}`;
            const isLast = index === slug.length - 1;

            return (
              <div key={index} className="flex items-center">
                <span className="mx-3 text-slate-300 font-light">/</span>
                {isLast ? (
                  <span className="capitalize font-black text-slate-800 tracking-tight">{segment}</span>
                ) : (
                  <Link href={href} className="capitalize hover:text-indigo-500 transition-colors font-medium">
                    {segment}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* --- Part 2: 메인 콘텐츠 카드 --- */}
        <main className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          {/* 상단 화려한 그라데이션 헤더 */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 text-white">
            <h1 className="text-4xl md:text-5xl font-black capitalize tracking-tighter mb-4">
              {title.replace(/-/g, ' ')}
            </h1>
            <p className="text-indigo-100 font-medium opacity-80">
              {pathDepth === 0 ? "최신 기술 문서를 한곳에서 관리합니다." : `위키 계층 구조: Level ${pathDepth}`}
            </p>
          </div>

          <div className="p-10">
            <div className="prose prose-slate max-w-none">
              <p className="text-xl leading-relaxed text-slate-600 mb-10">
                {content}
              </p>

              {/* 최상위 홈일 때만 보여주는 추천 카드 그리드 */}
              {pathDepth === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {['react', 'nextjs', 'typescript', 'hooks'].map((item) => (
                    <Link key={item} href={`/docs/${item}`} className="p-6 border border-slate-100 rounded-3xl hover:border-indigo-500 hover:shadow-lg transition-all group bg-slate-50/50">
                      <h3 className="font-black text-lg capitalize text-slate-800 group-hover:text-indigo-600 flex items-center justify-between">
                        {item} Docs 
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </h3>
                      <p className="text-sm text-slate-500 mt-2 font-medium">Click to explore {item} documentation.</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-16 flex items-center justify-between border-t border-slate-50 pt-8">
              <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                📄 문서 수정하기
              </button>
              <div className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                Array Path: {JSON.stringify(slug)}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
