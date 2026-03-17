import { forwardRef } from "react";
const MyInput = forwardRef((props, ref) => {
  return (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block' }}>{props.label}</label>
      <input ref={ref} {...props} style={{ padding: '8px', border: '2px solid blue' }} />
    </div>
  );
});
export default MyInput;