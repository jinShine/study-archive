import { useRef } from "react";
export default function VideoOptimizer() {
  const videoRef = useRef(null);
  const lastTimeRef = useRef(0);
  const onTimeUpdate = () => { if (videoRef.current) lastTimeRef.current = videoRef.current.currentTime; };
  const saveProgress = () => { alert(`기록 지점: ${Math.floor(lastTimeRef.current)}초`); };
  return (
    <div style={{ marginTop: '20px', padding: '20px', background: '#eee' }}>
      <h3>🎬 비디오 최적화</h3>
      <video ref={videoRef} onTimeUpdate={onTimeUpdate} controls width="100%">
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
      <button onClick={saveProgress}>저장</button>
    </div>
  );
}