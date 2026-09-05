import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui', maxWidth: 640 }}>
          <h1 style={{ color: '#be123c' }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#fff1f2', padding: 16, borderRadius: 8 }}>
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
          </pre>
          <button type="button" onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 16px' }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster position="top-right" />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </RootErrorBoundary>
  </React.StrictMode>
);
