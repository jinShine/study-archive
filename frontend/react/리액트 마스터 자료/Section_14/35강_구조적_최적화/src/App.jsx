import HeavyComponent from "./components/HeavyComponent";
import InputBox from "./components/InputBox";
import ColorPickerWrapper from "./components/ColorPicker";
export default function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>구조적 최적화 실습</h1>
      <InputBox />
      <hr />
      <ColorPickerWrapper>
        <HeavyComponent />
      </ColorPickerWrapper>
    </div>
  );
}