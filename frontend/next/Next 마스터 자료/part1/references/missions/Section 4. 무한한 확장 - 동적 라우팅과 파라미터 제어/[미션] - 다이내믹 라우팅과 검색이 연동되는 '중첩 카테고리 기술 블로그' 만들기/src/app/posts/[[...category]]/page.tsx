import Link from "next/link";
import SearchForm from "@/components/SearchForm";

const allPosts = [
  { id: 1, title: "Next.js 15 라우팅 완벽 가이드", path: ["frontend", "nextjs"], views: 150 },
  { id: 2, title: "React 19 훅스 파헤치기", path: ["frontend", "react"], views: 230 },
  { id: 3, title: "상태 관리 라이브러리 비교", path: ["frontend", "react"], views: 120 },
  { id: 4, title: "Node.js 백엔드 기초", path: ["backend", "nodejs"], views: 90 },
];

interface PageProps {
  params: Promise<{ category?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps) {
  const { category = [] } = await params;
  const resolvedSearchParams = await searchParams;

  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : "";
  const sortOrder = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : "";

  let filteredPosts = [...allPosts];

  if (category.length > 0) {
    filteredPosts = filteredPosts.filter((post) => {
      return category.every((cat, index) => post.path[index] === cat);
    });
  }

  if (query) {
    filteredPosts = filteredPosts.filter((post) =>
      post.title.includes(query)
    );
  }

  if (sortOrder === "views") {
    filteredPosts.sort((a, b) => b.views - a.views);
  }

  return (
    <div className="p-10 max-w-5xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
        <SearchForm initialQuery={query} />
        
        <div className="flex gap-2 text-sm text-black">
          <Link 
            href={{ query: { q: query, sort: 'views' } }}
            className="px-4 py-2 border border-gray-300 bg-white rounded-md hover:bg-gray-100"
          >
            조회수 높은 순 ⬆️
          </Link>
          <Link 
            href="/posts"
            className="px-4 py-2 border border-gray-300 bg-white rounded-md hover:bg-gray-100"
          >
            초기화 🔄
          </Link>
        </div>
      </div>

      <nav className="flex items-center text-sm text-gray-500 mb-6 gap-2">
        <Link href="/posts" className="hover:text-blue-600 font-bold">홈</Link>
        {category.map((cat, index) => {
          const href = `/posts/${category.slice(0, index + 1).join("/")}`;
          return (
            <div key={index} className="flex items-center gap-2">
              <span>&gt;</span>
              <Link href={href} className="hover:text-blue-600 capitalize">
                {cat}
              </Link>
            </div>
          );
        })}
      </nav>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {query ? `📌 검색 결과: "${query}"` : "📌 게시글 목록"}
        </h2>
        
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition bg-white text-black">
                <div className="text-xs text-blue-500 font-bold mb-2 uppercase">
                  {post.path.join(" > ")}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-sm text-gray-500">👁️ 조회수: {post.views}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-gray-50 rounded-lg text-gray-500">
            조건에 맞는 게시글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
