import type { Metadata, ResolvingMetadata } from "next";
import { Product, WithContext } from "schema-dts";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function fetchRoutineById(id: string) {
  return {
    title: `한 달 만에 끝내는 프론트엔드 취업 루틴 (${id}번)`,
    summary:
      "SEO 최적화를 통해 검색 결과 최상단에 노출될 마스터 클래스 루틴입니다.",
    thumbnailUrl: "https://mystudyplanner.com/images/frontend-routine.jpg",
  };
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedParams = await params;
  const routineData = await fetchRoutineById(resolvedParams.id);
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: routineData.title,
    description: routineData.summary,
    openGraph: {
      title: routineData.title,
      description: routineData.summary,
      images: [routineData.thumbnailUrl, ...previousImages],
      type: "article",
    },
  };
}

export default async function RoutineDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const routineData = await fetchRoutineById(resolvedParams.id);

  const jsonLd: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: routineData.title,
    description: routineData.summary,
    image: routineData.thumbnailUrl,
    provider: {
      "@type": "Organization",
      name: "AI 스터디 플래너",
      sameAs: "https://mystudyplanner.com",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1250",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
  };

  return (
    <section style={{ padding: "2rem" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\u003c"),
        }}
      />
      <h1>{routineData.title}</h1>
      <p>{routineData.summary}</p>
      <p>
        ⚠️ 이 페이지의 소스 보기를 클릭하여 구글 로봇의 시선으로 메타데이터를
        확인해보세요!
      </p>
    </section>
  );
}
