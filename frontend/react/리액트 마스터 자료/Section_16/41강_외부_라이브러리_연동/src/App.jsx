import { useRef, useState } from 'react';
import MyDatePicker from './components/MyDatePicker';
export default function App() {
  const datePickerRef = useRef();
  const [date, setDate] = useState("");
  return (
    <div style={{ padding: '20px' }}>
      <h1>DatePicker Control</h1>
      <p>Date: {date}</p>
      <button onClick={() => datePickerRef.current.openPicker()}>Open</button>
      <button onClick={() => datePickerRef.current.clearDate()}>Clear</button>
      <hr />
      <MyDatePicker ref={datePickerRef} onChange={setDate} />
    </div>
  );
}