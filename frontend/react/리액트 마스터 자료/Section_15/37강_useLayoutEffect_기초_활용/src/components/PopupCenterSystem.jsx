import { useState, useLayoutEffect, useRef } from 'react';
export default function PopupCenterSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const popupRef = useRef(null);
  useLayoutEffect(() => {
    if (isOpen && popupRef.current) {
      setOffset(popupRef.current.offsetHeight / 2);
    }
  }, [isOpen]);
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <button onClick={() => setIsOpen(!isOpen)}>팝업 토글</button>
      {isOpen && (
        <div ref={popupRef} style={{
          position: 'fixed', top: `calc(50% - ${offset}px)`, left: '50%',
          transform: 'translateX(-50%)', padding: '40px', backgroundColor: 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          완벽한 정중앙 보정 팝업
        </div>
      )}
    </div>
  );
}