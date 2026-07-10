import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',gap:'16px',fontFamily:'Inter,sans-serif',background:'#0d1117'}}>
          <div style={{fontSize:'48px'}}>⚠️</div>
          <div style={{fontSize:'18px',fontWeight:'700',color:'#e6edf3'}}>Something went wrong</div>
          <div style={{fontSize:'13px',color:'#8b949e',maxWidth:'400px',textAlign:'center'}}>{this.state.error?.message}</div>
          <button onClick={() => window.location.href = '/'} style={{marginTop:'8px',padding:'10px 24px',borderRadius:'10px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',color:'#fff',cursor:'pointer',fontFamily:'inherit',fontWeight:'600',fontSize:'13px'}}>
            Go to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
