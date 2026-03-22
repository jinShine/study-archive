'use client';
import { useState } from 'react';

export default function LikeButton() {
  const [liked, setLiked] = useState(false);
  return (
    <button onClick={() => setLiked(!liked)} className="text-2xl transition-transform active:scale-125">
      {liked ? '❤️' : '🤍'}
    </button>
  );
}
