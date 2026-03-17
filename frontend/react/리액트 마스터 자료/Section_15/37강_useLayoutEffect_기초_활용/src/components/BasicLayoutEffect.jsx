import { useState, useLayoutEffect, useRef } from 'react';
export default function BasicLayoutEffect() {
  const elementRef = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (elementRef.current) {
      setWidth(elementRef.current.getBoundingClientRect().width);
    }
  }, []);
  return (
    <div ref={elementRef} style={{ width: '50%', background: 'lightgrey', padding: '20px' }}>
      내 너비는 {width}px 입니다.
    </div>
  );
}