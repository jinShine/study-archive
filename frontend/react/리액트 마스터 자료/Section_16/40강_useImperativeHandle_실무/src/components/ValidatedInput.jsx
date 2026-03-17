import { useState, useImperativeHandle, forwardRef, useRef } from 'react';
const ValidatedInput = forwardRef((props, ref) => {
  const inputRef = useRef();
  const [error, setError] = useState(false);
  useImperativeHandle(ref, () => ({
    validate: () => {
      const isValid = !!inputRef.current.value;
      setError(!isValid);
      return isValid;
    },
    focus: () => inputRef.current.focus()
  }), []);
  return (
    <div>
      <input ref={inputRef} placeholder={props.placeholder} style={{ border: error ? '2px solid red' : '1px solid gray' }} />
      {error && <p style={{ color: 'red', fontSize: '10px' }}>필수입니다.</p>}
    </div>
  );
});
export default ValidatedInput;