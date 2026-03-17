import { useImperativeHandle, forwardRef, useRef } from 'react';
const AnimatedBox = forwardRef((props, ref) => {
  const boxRef = useRef();
  useImperativeHandle(ref, () => ({
    startShake: () => {
      boxRef.current.style.animation = 'none';
      void boxRef.current.offsetWidth;
      boxRef.current.style.animation = 'shake 0.5s';
    }
  }), []);
  return <div ref={boxRef} style={{ width: 50, height: 50, background: 'coral' }}>Box</div>;
});
export default AnimatedBox;