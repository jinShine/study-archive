export default async function InterceptedDetail({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const resolvedParams = await paramsPromise;

  const photoId = resolvedParams.id;

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-2">
        🎯 낚아챈 화면 (Intercepted View)
      </h2>

      <p className="text-blue-800 leading-relaxed">
        현재 피드(Feed)의 <strong>레이아웃 맥락을 파괴하지 않고</strong>,<br />
        주소창만{" "}
        <code className="bg-white px-2 py-1 rounded font-mono text-sm shadow-sm">
          /photo/{photoId}
        </code>{" "}
        로 변경한 뒤 이 화면을 렌더링했습니다.
      </p>

      <p className="mt-4 text-sm font-bold text-red-500">
        ※ 지금 키보드의 F5(새로고침)를 눌러보세요!
      </p>
    </div>
  );
}
