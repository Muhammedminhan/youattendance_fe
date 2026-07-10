import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const IS_CONFIGURED = Boolean(GOOGLE_CLIENT_ID);
const SHOW_DEMO = import.meta.env.VITE_DEMO_LOGIN === 'true';

export default function Login() {
  const { user, login } = useAuth();
  const { isLight, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Stable callback so it can be listed in the useEffect dep array
  const handleGoogleResponse = useCallback((res) => {
    // NOTE: atob decoding only reads the payload for display purposes.
    // The credential JWT must be verified server-side against Google's public keys
    // before granting any backend access — never trust this payload alone.
    const payload = JSON.parse(atob(res.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    saveAndRedirect({ name: payload.name, email: payload.email, picture: payload.picture, provider: 'google', credential: res.credential });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login]);

  useEffect(() => {
    if (!IS_CONFIGURED) return;
    let interval;
    const initGIS = () => {
      if (typeof window.google === 'undefined') return false;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      const btn = document.getElementById('gis-btn');
      if (btn) {
        window.google.accounts.id.renderButton(btn, {
          theme: 'outline', size: 'large', width: 340,
          shape: 'rectangular', text: 'continue_with',
        });
      }
      const googleBtn = document.getElementById('googleBtn');
      if (googleBtn) googleBtn.style.display = 'none';
      return true;
    };
    if (!initGIS()) {
      interval = setInterval(() => { if (initGIS()) clearInterval(interval); }, 100);
    }
    return () => clearInterval(interval);
  }, [handleGoogleResponse]);

  function signInWithGoogle() {
    if (!IS_CONFIGURED) {
      document.getElementById('configNotice').style.display = 'block';
      return;
    }
    if (typeof window.google !== 'undefined') window.google.accounts.id.prompt();
  }

  function signInDemo() {
    saveAndRedirect({
      name: 'Demo HR User',
      email: 'demo@youattendance.com',
      picture: 'https://ui-avatars.com/api/?name=Demo+HR&background=6366f1&color=fff&size=128&rounded=true',
      provider: 'demo',
    });
  }

  function saveAndRedirect(userData) {
    login(userData);
    navigate('/', { replace: true });
  }

  return (
    <>
      <style>{`
        .login-page-body{display:flex;align-items:center;justify-content:center;min-height:100vh;overflow:hidden;background:#0d1117}
        .login-wrap{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;width:860px;max-width:96vw;min-height:520px;border-radius:24px;overflow:hidden;border:1px solid #30363d;box-shadow:0 24px 64px rgba(0,0,0,.55)}
        .login-left{background:linear-gradient(145deg,#1a1f35 0%,#0d1117 100%);padding:48px 40px;display:flex;flex-direction:column;justify-content:space-between;border-right:1px solid #21262d;position:relative;overflow:hidden}
        .left-glow{position:absolute;top:-60px;left:-60px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,.25) 0%,transparent 70%);pointer-events:none}
        .brand-mark{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(99,102,241,.45);margin-bottom:20px}
        .brand-name{font-size:22px;font-weight:800;color:#e6edf3;letter-spacing:-.03em;line-height:1.2}
        .brand-name span{color:#a78bfa;font-style:italic}
        .brand-sub{font-size:13px;color:#6e7681;margin-top:6px}
        .feature-list{display:flex;flex-direction:column;gap:14px;margin-top:auto;padding-top:40px}
        .feature{display:flex;align-items:center;gap:12px}
        .feature-icon{width:34px;height:34px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px}
        .feature-text{font-size:13px;color:#8b949e;font-weight:500}
        .feature-text strong{color:#c9d1d9;font-weight:700}
        .left-footer{font-size:11px;color:#484f58;margin-top:32px}
        .login-right{background:#161b22;padding:48px 44px;display:flex;flex-direction:column;justify-content:center}
        .login-title{font-size:20px;font-weight:800;color:#e6edf3;letter-spacing:-.02em;margin-bottom:6px}
        .login-sub{font-size:13px;color:#6e7681;margin-bottom:36px;line-height:1.5}
        .google-btn{width:100%;padding:13px 20px;border-radius:12px;background:#ffffff;border:none;display:flex;align-items:center;justify-content:center;gap:12px;font-size:14px;font-weight:600;color:#1f2328;font-family:inherit;cursor:pointer;transition:box-shadow .2s,transform .15s;box-shadow:0 2px 8px rgba(0,0,0,.25)}
        .google-btn:hover{box-shadow:0 6px 20px rgba(0,0,0,.35);transform:translateY(-1px)}
        .divider{display:flex;align-items:center;gap:12px;margin:20px 0;color:#484f58;font-size:12px}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:#21262d}
        .demo-btn{width:100%;padding:12px;border-radius:12px;font-size:13px;font-weight:600;font-family:inherit;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.22);color:#a78bfa;cursor:pointer;transition:background .15s,border-color .15s}
        .demo-btn:hover{background:rgba(99,102,241,.20);border-color:rgba(99,102,241,.40)}
        .login-terms{font-size:11px;color:#484f58;margin-top:24px;text-align:center;line-height:1.6}
        .notice{margin-top:16px;padding:11px 14px;border-radius:10px;background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.22);font-size:12px;color:#fde68a;line-height:1.5;display:none}
        html.light .login-wrap{border-color:#d0d7de;box-shadow:0 24px 64px rgba(0,0,0,.12)}
        html.light .login-left{background:linear-gradient(145deg,#f0f4ff 0%,#e8edf8 100%);border-right-color:#d0d7de}
        html.light .brand-name{color:rgba(15,23,42,.92)}
        html.light .brand-sub{color:rgba(71,85,105,.60)}
        html.light .feature-text{color:rgba(71,85,105,.70)}
        html.light .feature-text strong{color:rgba(15,23,42,.85)}
        html.light .left-footer{color:rgba(71,85,105,.40)}
        html.light .login-right{background:#ffffff}
        html.light .login-title{color:rgba(15,23,42,.90)}
        html.light .login-sub{color:rgba(71,85,105,.65)}
        html.light .divider{color:rgba(71,85,105,.40)}
        html.light .divider::before,html.light .divider::after{background:#d0d7de}
        html.light .demo-btn{background:rgba(99,102,241,.07);border-color:rgba(99,102,241,.18);color:#4f46e5}
        html.light .demo-btn:hover{background:rgba(99,102,241,.12)}
        html.light .login-terms{color:rgba(71,85,105,.50)}
        @media(max-width:680px){.login-wrap{grid-template-columns:1fr}.login-left{display:none}.login-right{padding:40px 28px}}
      `}</style>

      <button className="theme-btn" onClick={toggleTheme}>{isLight ? '🌙' : '☀️'}</button>

      <div className="login-page-body" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}>
        <div className="login-wrap">
          {/* Left branding */}
          <div className="login-left">
            <div className="left-glow"></div>
            <div>
              <div className="brand-mark">
                <svg width="38" height="38" viewBox="0 0 28 28" fill="none">
                  <text x="3" y="14" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="10" fill="#ffffff" letterSpacing="-0.3">YOU</text>
                  <polyline points="3,20 6.5,24 13,17" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="18" cy="19" r="1.6" fill="rgba(255,255,255,.85)"/>
                  <circle cx="23" cy="19" r="1.6" fill="rgba(255,255,255,.85)"/>
                  <circle cx="18" cy="24" r="1.6" fill="rgba(255,255,255,.85)"/>
                  <circle cx="23" cy="24" r="1.6" fill="rgba(255,255,255,.85)"/>
                </svg>
              </div>
              <div className="brand-name"><span>YOU</span>Attendance</div>
              <div className="brand-sub">HR Leave Management Dashboard</div>
            </div>
            <div className="feature-list">
              <div className="feature"><div className="feature-icon" style={{background:'rgba(99,102,241,.20)'}}>📊</div><div className="feature-text"><strong>Live dashboard</strong> — real-time leave overview</div></div>
              <div className="feature"><div className="feature-icon" style={{background:'rgba(16,185,129,.18)'}}>👥</div><div className="feature-text"><strong>Employee profiles</strong> — full leave history &amp; balance</div></div>
              <div className="feature"><div className="feature-icon" style={{background:'rgba(245,158,11,.18)'}}>⚠️</div><div className="feature-text"><strong>Smart alerts</strong> — continuous leave detection</div></div>
              <div className="feature"><div className="feature-icon" style={{background:'rgba(236,72,153,.18)'}}>🔀</div><div className="feature-text"><strong>Compare mode</strong> — side-by-side analysis</div></div>
            </div>
            <div className="left-footer">© 2026 YOUAttendance · HR Intelligence Platform</div>
          </div>

          {/* Right sign-in */}
          <div className="login-right">
            <div className="login-title">Welcome back 👋</div>
            <div className="login-sub">Sign in with your Google workspace account<br/>to access the HR dashboard.</div>

            <div id="gis-btn"></div>

            <button className="google-btn" id="googleBtn" onClick={signInWithGoogle}>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <div className="notice" id="configNotice">
              ⚙️ Configure Google Client ID in Login.jsx to enable real Google login.
            </div>

            {SHOW_DEMO && (
              <>
                <div className="divider">or</div>
                <button className="demo-btn" onClick={signInDemo}>Continue as Demo User</button>
              </>
            )}

            <div className="login-terms">
              By signing in you agree to our Terms of Service and Privacy Policy.<br/>
              Your data is never shared with third parties.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
