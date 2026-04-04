import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <style>{`
            .eb-root {
              min-height: 100vh;
              background: #f7f3ee;
              display: flex; align-items: center; justify-content: center;
              padding: 24px; font-family: 'DM Sans', sans-serif;
            }
            .eb-card {
              background: #fff; border-radius: 24px; padding: 40px 32px;
              text-align: center; max-width: 380px; width: 100%;
              border: 1px solid #e8e2da;
              box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            }
            .eb-icon-wrap {
              width: 72px; height: 72px; border-radius: 20px;
              background: #fff5f5; border: 1px solid #f0d0d0;
              display: flex; align-items: center; justify-content: center;
              margin: 0 auto 20px;
            }
            .eb-title {
              font-family: 'Playfair Display', serif;
              font-size: 22px; font-weight: 700; color: #1c2e1c;
              margin-bottom: 8px;
            }
            .eb-sub {
              font-size: 13px; color: #9a9080; line-height: 1.55; margin-bottom: 24px;
            }
            .eb-btn {
              display: inline-flex; align-items: center; gap: 8px;
              padding: 12px 24px; border-radius: 14px; border: none;
              background: #1c3a1c; color: #f0ede8;
              font-size: 14px; font-weight: 700; cursor: pointer;
              font-family: 'DM Sans', sans-serif; transition: background 0.15s;
              box-shadow: 0 4px 14px rgba(28,58,28,0.25);
            }
            .eb-btn:hover { background: #2a5a2a; }
          `}</style>

          <div className="eb-root">
            <div className="eb-card">
              <div className="eb-icon-wrap">
                <AlertTriangle size={32} color="#c0392b" />
              </div>
              <div className="eb-title">Something went wrong</div>
              <div className="eb-sub">We're sorry for the inconvenience. Please try reloading the page.</div>
              <button className="eb-btn" onClick={() => window.location.reload()}>
                <RefreshCw size={16} />
                Reload Page
              </button>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;