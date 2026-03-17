// 50강. 아이콘 활용하기 — React 프로젝트에서 가장 많이 쓰이는 시각 요소 추가하기

// [1️⃣ 설치 명령어]
// react-icons 설치 (yarn 또는 npm)
yarn add react-icons
# or
npm install react-icons --save


// [2️⃣ App.js]
import { FaHeart } from "react-icons/fa";

export default function App() {
  return (
    <button>
      <FaHeart /> 좋아요
    </button>
  );
}



// [3️⃣ LikeButton.js]
import { useState } from "react";
import { FaHeart } from "react-icons/fa";

export default function LikeButton() {
  const [liked, setLiked] = useState(false);

  const toggleLike = () => setLiked((prev) => !prev);

  const baseStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
  };

  const dynamicStyle = {
    color: liked ? "crimson" : "gray",
  };

  return (
    <button onClick={toggleLike} style={{ ...baseStyle, ...dynamicStyle }}>
      <FaHeart /> {liked ? "좋아요 취소" : "좋아요"}
    </button>
  );
}
