'use client';

import { useState } from 'react';

export default function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button
      onClick={() => setLiked(!liked)}
      className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all ${
        liked 
        ? 'bg-pink-50 text-pink-600 border-2 border-pink-200' 
        : 'bg-slate-50 text-slate-400 border-2 border-transparent hover:bg-slate-100'
      }`}
    >
      <span className={`text-2xl transition-transform ${liked ? 'scale-125' : 'grayscale group-hover:grayscale-0'}`}>
        {liked ? '❤️' : '🤍'}
      </span>
      {liked ? 'Liked!' : 'Click to Like'}
    </button>
  );
}
