'use client';
import { useOptimistic } from 'react';
import { toggleProductLikeAction } from '../actions';

export default function LikeButton({ productId, initialLiked }: { productId: string, initialLiked: boolean }) {
  const [optimisticLiked, addOptimisticLike] = useOptimistic(
    initialLiked,
    (currentState, optimisticValue: boolean) => optimisticValue
  );

  const handleLike = async () => {
    const newLikeStatus = !optimisticLiked;
    // 🚨 0초 만에 화면 상태 강제 갱신
    addOptimisticLike(newLikeStatus);

    try {
      await toggleProductLikeAction(productId, newLikeStatus);
    } catch (error) {
      alert("⚠️ 서버 통신 실패: 좋아요 처리가 취소되고 원래 상태로 복구됩니다.");
      // 프레임워크에 의해 자동으로 낙관적 상태가 롤백됩니다.
    }
  };

  return (
    <form action={handleLike}>
      <button type="submit" className={`flex items-center gap-2 px-4 py-2 border rounded-full font-bold text-base cursor-pointer transition-all duration-200 shadow-sm ${optimisticLiked ? "border-red-200 text-red-500 bg-red-50" : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"}`}>
        <span>{optimisticLiked ? '❤️' : '🤍'}</span>
        <span>{optimisticLiked ? '좋아요 취소' : '좋아요'}</span>
      </button>
    </form>
  );
}