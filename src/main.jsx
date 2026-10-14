import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'katex/dist/katex.min.css'
import App from './App.jsx'

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("V-Eval Uncaught Error Boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '800px', width: '100%', backgroundColor: '#1e293b', padding: '28px', borderRadius: '24px', border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <h2 style={{ color: '#f43f5e', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
              ⚠️ Đã phát hiện lỗi thực thi giao diện (V-Eval Error Catcher)
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
              Hệ thống đã bắt được lỗi ngăn màn hình trắng:
            </p>
            <pre style={{ backgroundColor: '#090d16', padding: '16px', borderRadius: '12px', color: '#fb7185', overflowX: 'auto', fontSize: '12px', lineHeight: 1.6, maxHeight: '350px' }}>
              {this.state.error && (this.state.error.stack || this.state.error.toString())}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Tải Lại Trang
              </button>
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                style={{ padding: '10px 20px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Xóa Cache & Đăng Nhập Lại
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)

