import { useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const MyDatePicker = forwardRef((props, ref) => {
  const inputRef = useRef();
  const fp = useRef();

  useEffect(() => {
    fp.current = flatpickr(inputRef.current, {
      onChange: (dates, dateStr) => {
        if (props.onChange) props.onChange(dateStr);
      },
    });
    return () => {
      if (fp.current) fp.current.destroy();
    };
  }, [props]);

  useImperativeHandle(ref, () => ({
    openPicker: () => fp.current?.open(),
    closePicker: () => fp.current?.close(),
    clearDate: () => fp.current?.clear()
  }), []);

  return <input ref={inputRef} type="text" placeholder="날짜 선택..." style={{ padding: '8px' }} />;
});
export default MyDatePicker;