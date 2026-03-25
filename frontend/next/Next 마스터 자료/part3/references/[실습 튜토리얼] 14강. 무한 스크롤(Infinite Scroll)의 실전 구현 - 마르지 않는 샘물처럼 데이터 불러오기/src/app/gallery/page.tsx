import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cache, Suspense } from 'react';
import InfinitePhotoGallery from './InfinitePhotoGallery';

const getQueryClient = cache(() => new QueryClient());

async function GalleryPrefetch() {
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['photos', 'infinite'],
    queryFn: ({ pageParam = 1 }) =>
      fetch(`https://picsum.photos/v2/list?page=${pageParam}&limit=9`).then(res => res.json()),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InfinitePhotoGallery />
    </HydrationBoundary>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-xl text-gray-500 font-medium tracking-wide">첫 번째 갤러리 작품들을 정성스럽게 준비하고 있습니다...</div>}>
      <GalleryPrefetch />
    </Suspense>
  );
}
