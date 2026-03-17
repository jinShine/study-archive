import { useImperativeHandle, forwardRef, useRef } from 'react';
const MyInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => inputRef.current.value = ""
  }), []);
  return <input ref={inputRef} {...props} />;
});
export default MyInput;