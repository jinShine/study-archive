import React, { ErrorInfo, ReactNode } from 'react';
interface Props { children: ReactNode; fallback: ReactNode; }
interface State { hasError: boolean; error: unknown; }
export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: unknown): State { return { hasError: true, error }; }
  componentDidCatch(error: unknown, errorInfo: ErrorInfo) { console.error("Error Info:", errorInfo); }
  render() {
    if (this.state.hasError) {
      let msg = "오류 발생";
      if (this.state.error instanceof Error) msg = this.state.error.message;
      return (
        <div style={{ padding: '20px', border: '1px solid red', background: '#fff0f0' }}>
          <h2>Error Catch!</h2>
          <p>{msg}</p>
          {this.props.fallback}
        </div>
      );
    }
    return this.props.children;
  }
}