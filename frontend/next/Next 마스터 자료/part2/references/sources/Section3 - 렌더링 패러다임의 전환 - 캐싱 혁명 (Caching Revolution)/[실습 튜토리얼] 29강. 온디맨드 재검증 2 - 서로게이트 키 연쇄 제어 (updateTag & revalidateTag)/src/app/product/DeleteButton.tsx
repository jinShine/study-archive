'use client';
import { deleteReviewInstantAction } from '@/app/actions';

export default function DeleteButton({ reviewId }: { reviewId: string }) {
  return (
    <button 
      onClick={() => deleteReviewInstantAction(reviewId)}
      className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-bold cursor-pointer border-none transition-colors"
    >
      리뷰 즉시 삭제
    </button>
  );
}