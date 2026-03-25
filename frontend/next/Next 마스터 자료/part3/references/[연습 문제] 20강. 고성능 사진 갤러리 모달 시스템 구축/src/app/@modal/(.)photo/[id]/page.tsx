\'use client\';
import { useRouter } from 'next/navigation';
import { useGalleryStore } from '@/components/GalleryProvider';
import { use, useEffect } from 'react';
export default function PhotoModal({ params }: any) {
  const router = useRouter();
  const { id } = use(params);
  const isLiked = useGalleryStore((s: any) => s.likedPhotos.includes(Number(id)));
  const toggleLike = useGalleryStore((s: any) => s.toggleLike);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-xl z-50 flex items-center justify-center p-8" onClick={() => router.back()}>
      <div className="bg-zinc-900 text-white p-20 rounded-full w-[400px] h-[400px] flex flex-col items-center justify-center text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-4xl font-thin mb-8">N° {id}</h2>
        <button onClick={() => toggleLike(Number(id))} className="px-6 py-2 border rounded-full text-xs mb-8 transition-all">
          {isLiked ? 'UNLIKE' : 'LIKE'}
        </button>
        <button onClick={() => router.back()} className="text-zinc-500 text-xs">CLOSE</button>
      </div>
    </div>
  );
}