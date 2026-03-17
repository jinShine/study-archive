import AccessibilityInput from "./components/AccessibilityInput";
import RegistrationForm from "./components/RegistrationForm";
export default function App() {
  return (
    <div style={{ padding: '20px' }}>
      <AccessibilityInput label="사용자 아이디" />
      <RegistrationForm />
    </div>
  );
}