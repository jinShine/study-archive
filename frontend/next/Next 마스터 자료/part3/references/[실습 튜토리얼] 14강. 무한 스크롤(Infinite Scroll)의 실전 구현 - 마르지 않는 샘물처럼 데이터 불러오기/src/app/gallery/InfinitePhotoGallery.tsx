'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

interface Photo {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

export default function InfinitePhotoGallery() {
  const { ref, inView } = useInView({ delay: 300 });
  const previousPageLengthRef = useRef(0);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['photos', 'infinite'],
    queryFn: ({ pageParam }) =>
      fetch(`https://picsum.photos/v2/list?page=${pageParam}&limit=9`).then(res => res.json()),
    initialPageParam: 2,
    // maxPages: 4,
    staleTime: 1000 * 60 * 5,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      return lastPage.length === 9 ? lastPageParam + 1 : undefined;
    },
  });

  const allPhotos = useMemo(() => {
    return data?.pages.flatMap((page) => page) || [];
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const currentPageLength = data?.pages.length || 0;
    if (currentPageLength > previousPageLengthRef.current) {
      if (previousPageLengthRef.current > 0) {
        setTimeout(() => {
          window.scrollBy({ top: 200, behavior: 'smooth' });
        }, 100);
      }
      previousPageLengthRef.current = currentPageLength;
    }
  }, [data?.pages.length]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
          Infinite Inspiration
        </h1>
        <p className="text-lg text-gray-500">
          끝없이 이어지는 아름다운 순간들을 탐험하세요.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {allPhotos.map((photo: Photo, index: number) => (
          <div
            key={`${photo.id}-${index}`}
            className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <Image
              src={photo.download_url}
              alt={`Photo by ${photo.author}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              priority={index < 6}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-sm font-medium text-white/80 mb-1">Photographer</p>
              <p className="text-xl font-bold text-white tracking-wide">{photo.author}</p>
            </div>
          </div>
        ))}
      </div>

      <div ref={ref} className="mt-16 h-32 flex flex-col items-center justify-center gap-4">
        {isFetchingNextPage ? (
          <>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm font-medium text-gray-500 tracking-wider">새로운 영감을 불러오는 중...</p>
          </>
        ) : hasNextPage ? (
          <p className="text-sm font-medium text-gray-400">스크롤을 내려 계속 탐험하세요</p>
        ) : (
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-100 rounded-full">
            <span className="text-xl">✨</span>
            <p className="text-sm font-semibold text-gray-600">모든 작품을 감상하셨습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
