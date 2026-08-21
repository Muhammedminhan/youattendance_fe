import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const IS_CONFIGURED = Boolean(GOOGLE_CLIENT_ID);
const FEATURES = [
  {
    color: '#2563EB',
    bg: 'rgba(37,99,235,.13)',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="8" width="2.5" height="7" rx=".8" fill="white" opacity=".7"/>
        <rect x="5" y="5" width="2.5" height="10" rx=".8" fill="white" opacity=".85"/>
        <rect x="9" y="2" width="2.5" height="13" rx=".8" fill="white"/>
        <rect x="13" y="4.5" width="2.5" height="10.5" rx=".8" fill="white" opacity=".6"/>
      </svg>
    ),
    title: 'Live Dashboard',
    sub: 'Real-time leave overview & analytics',
  },
  {
    color: '#0891B2',
    bg: 'rgba(8,145,178,.13)',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <circle cx="5.5" cy="4.5" r="2.2" stroke="white" strokeWidth="1.4" fill="none"/>
        <path d="M1 14c0-2.5 2-4.5 4.5-4.5S10 11.5 10 14" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        <circle cx="11.5" cy="4.5" r="1.8" stroke="white" strokeWidth="1.3" fill="none" opacity=".65"/>
        <path d="M13 14c0-2-1.1-3.7-2.7-4.3" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity=".65"/>
      </svg>
    ),
    title: 'Employee Profiles',
    sub: 'Full leave history & balance tracking',
  },
  {
    color: '#D97706',
    bg: 'rgba(217,119,6,.13)',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5a4.5 4.5 0 014.5 4.5v2.8l1.1 1.7H2.4l1.1-1.7V6A4.5 4.5 0 018 1.5z" stroke="white" strokeWidth="1.4" fill="none"/>
        <path d="M6.2 12.5a1.8 1.8 0 003.6 0" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
        <circle cx="12" cy="3.5" r="2" fill="#F59E0B"/>
        <circle cx="12" cy="3.5" r="1.2" fill="white"/>
      </svg>
    ),
    title: 'Smart Alerts',
    sub: 'Continuous leave pattern detection',
  },
  {
    color: '#7C3AED',
    bg: 'rgba(124,58,237,.13)',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="6" height="10" rx="1.2" stroke="white" strokeWidth="1.4" fill="none"/>
        <rect x="9" y="3" width="6" height="10" rx="1.2" stroke="white" strokeWidth="1.4" fill="none"/>
        <line x1="7.5" y1="8" x2="8.5" y2="8" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Compare Mode',
    sub: 'Side-by-side employee analysis',
  },
];

export default function Login() {
  const { user, login } = useAuth();
  const { isLight, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleGoogleResponse = useCallback((res) => {
    setVerifying(true);
    setAuthError('');
    try {
      const [, payloadB64] = res.credential.split('.');
      const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.email) throw new Error('No email in Google response');
      saveAndRedirect({
        email: payload.email,
        name: payload.name || '',
        picture: payload.picture || '',
        provider: 'google',
      });
    } catch {
      setAuthError('Sign-in failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login]);

  useEffect(() => {
    if (!IS_CONFIGURED) return;
    let interval;
    const initGIS = () => {
      if (typeof window.google === 'undefined') return false;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleResponse });
      const btn = document.getElementById('gis-btn');
      if (btn) window.google.accounts.id.renderButton(btn, { theme: 'outline', size: 'large', width: 340, shape: 'rectangular', text: 'continue_with' });
      const googleBtn = document.getElementById('googleBtn');
      if (googleBtn) googleBtn.style.display = 'none';
      return true;
    };
    if (!initGIS()) interval = setInterval(() => { if (initGIS()) clearInterval(interval); }, 100);
    return () => clearInterval(interval);
  }, [handleGoogleResponse]);

  function signInWithGoogle() {
    if (!IS_CONFIGURED) { document.getElementById('configNotice').style.display = 'block'; return; }
    if (typeof window.google !== 'undefined') window.google.accounts.id.prompt();
  }

  function saveAndRedirect(userData) { login(userData); navigate('/', { replace: true }); }

  return (
    <>
      <style>{`
        .lp{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#060c18;position:relative;overflow:hidden}
        .lp-bg1{position:absolute;top:-120px;left:-80px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(37,99,235,.18) 0%,transparent 68%);pointer-events:none}
        .lp-bg2{position:absolute;bottom:-100px;right:-60px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.13) 0%,transparent 65%);pointer-events:none}
        .lp-bg3{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:1px;background:linear-gradient(90deg,transparent,rgba(37,99,235,.15),transparent);pointer-events:none}

        .lw{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;width:880px;max-width:96vw;min-height:540px;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,.06);box-shadow:0 32px 80px rgba(0,0,0,.65),0 0 0 1px rgba(37,99,235,.08)}
        .lw-left{background:linear-gradient(145deg,#0d1626 0%,#060c18 60%,#09101f 100%);padding:44px 40px;display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.05);position:relative;overflow:hidden}
        .lw-right{background:#0b1120;padding:48px 44px;display:flex;flex-direction:column;justify-content:center}

        /* brand */
        .lp-mark{width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,#1d4ed8,#2563eb);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(29,78,216,.45);margin-bottom:18px;flex-shrink:0}
        .lp-name{font-size:22px;font-weight:800;color:#f1f5f9;letter-spacing:-.04em;line-height:1.1}
        .lp-name span{color:#60a5fa;font-style:normal}
        .lp-tagline{font-size:12px;font-weight:500;color:rgba(148,163,184,.55);margin-top:6px;letter-spacing:.02em;text-transform:uppercase}

        /* features */
        .lp-features{display:flex;flex-direction:column;gap:12px;margin-top:auto;padding-top:36px}
        .lp-feat{display:flex;align-items:center;gap:13px}
        .lp-feat-ico{width:36px;height:36px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
        .lp-feat-label{font-size:13px;font-weight:600;color:rgba(241,245,249,.80)}
        .lp-feat-sub{font-size:11px;color:rgba(148,163,184,.50);margin-top:1px}
        .lp-footer{font-size:10.5px;color:rgba(100,116,139,.40);margin-top:28px;letter-spacing:.01em}

        /* right */
        .lp-title{font-size:22px;font-weight:800;color:#f1f5f9;letter-spacing:-.035em;margin-bottom:6px}
        .lp-sub{font-size:13px;color:rgba(148,163,184,.65);margin-bottom:32px;line-height:1.55}

        .lp-google{width:100%;padding:13px 20px;border-radius:11px;background:#ffffff;border:none;display:flex;align-items:center;justify-content:center;gap:11px;font-size:13.5px;font-weight:600;color:#111827;font-family:inherit;cursor:pointer;transition:box-shadow .2s,transform .15s;box-shadow:0 2px 10px rgba(0,0,0,.30)}
        .lp-google:hover{box-shadow:0 6px 22px rgba(0,0,0,.40);transform:translateY(-1px)}

        .lp-divider{display:flex;align-items:center;gap:12px;margin:18px 0;color:rgba(100,116,139,.45);font-size:11.5px;font-weight:500}
        .lp-divider::before,.lp-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.06)}

        .lp-demo{width:100%;padding:12px;border-radius:11px;font-size:13px;font-weight:600;font-family:inherit;background:rgba(37,99,235,.10);border:1px solid rgba(37,99,235,.22);color:#93c5fd;cursor:pointer;transition:background .15s,border-color .15s,transform .15s}
        .lp-demo:hover{background:rgba(37,99,235,.18);border-color:rgba(37,99,235,.40);transform:translateY(-1px)}

        .lp-terms{font-size:11px;color:rgba(100,116,139,.45);margin-top:22px;text-align:center;line-height:1.65}

        .lp-notice{margin-top:14px;padding:10px 14px;border-radius:9px;background:rgba(245,158,11,.09);border:1px solid rgba(245,158,11,.20);font-size:12px;color:#fde68a;line-height:1.5;display:none}

        /* light overrides */
        html.light .lp{background:#f0f4fa}
        html.light .lp-bg1{background:radial-gradient(circle,rgba(37,99,235,.10) 0%,transparent 68%)}
        html.light .lp-bg2{background:radial-gradient(circle,rgba(124,58,237,.08) 0%,transparent 65%)}
        html.light .lw{border-color:rgba(0,0,0,.08);box-shadow:0 24px 64px rgba(0,0,0,.12)}
        html.light .lw-left{background:linear-gradient(145deg,#ddeaff 0%,#e8f0fe 100%);border-right-color:rgba(0,0,0,.06)}
        html.light .lw-right{background:#ffffff}
        html.light .lp-mark{background:linear-gradient(135deg,#1d4ed8,#3b82f6)}
        html.light .lp-name{color:#0f172a}
        html.light .lp-name span{color:#2563eb}
        html.light .lp-tagline{color:rgba(71,85,105,.55)}
        html.light .lp-feat-label{color:rgba(15,23,42,.80)}
        html.light .lp-feat-sub{color:rgba(71,85,105,.55)}
        html.light .lp-footer{color:rgba(71,85,105,.40)}
        html.light .lp-title{color:#0f172a}
        html.light .lp-sub{color:rgba(71,85,105,.70)}
        html.light .lp-divider{color:rgba(71,85,105,.45)}
        html.light .lp-divider::before,html.light .lp-divider::after{background:#d1d5db}
        html.light .lp-demo{background:rgba(37,99,235,.07);border-color:rgba(37,99,235,.20);color:#1d4ed8}
        html.light .lp-demo:hover{background:rgba(37,99,235,.13);border-color:rgba(37,99,235,.36)}
        html.light .lp-terms{color:rgba(71,85,105,.50)}

        @media(max-width:680px){.lw{grid-template-columns:1fr}.lw-left{display:none}.lw-right{padding:40px 28px}}
      `}</style>

      <button className="theme-btn" onClick={toggleTheme}>{isLight ? '🌙' : '☀️'}</button>

      <div className="lp">
        <div className="lp-bg1"/><div className="lp-bg2"/><div className="lp-bg3"/>
        <div className="lw">

          {/* Left branding */}
          <div className="lw-left">
            <div>
              <div className="lp-mark" style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'0 4px 18px rgba(99,102,241,.45)'}}>
                <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
                  <circle cx="7" cy="6" r="2.5" fill="white" opacity=".95"/>
                  <path d="M2 16c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".95"/>
                  <circle cx="14" cy="6.5" r="2" fill="white" opacity=".60"/>
                  <path d="M12 16c0-2.21 1.12-4.14 2.8-5.28" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".60"/>
                </svg>
              </div>
              <div className="lp-name" style={{letterSpacing:'-.05em'}}>HRM</div>
              <div className="lp-tagline">HR Dashboard</div>
            </div>

            <div className="lp-features">
              {FEATURES.map(f => (
                <div className="lp-feat" key={f.title}>
                  <div className="lp-feat-ico" style={{background:f.bg,boxShadow:`0 2px 8px ${f.color}22`}}>
                    {f.icon}
                  </div>
                  <div>
                    <div className="lp-feat-label">{f.title}</div>
                    <div className="lp-feat-sub">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lp-footer">© 2026 HRM · HR Intelligence Platform</div>
          </div>

          {/* Right sign-in */}
          <div className="lw-right">
            <div className="lp-title">Welcome back</div>
            <div className="lp-sub">Sign in with your Google Workspace account<br/>to access the HR dashboard.</div>

            {verifying ? (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',
                padding:'14px',borderRadius:'10px',background:'rgba(37,99,235,.08)',
                border:'1px solid rgba(37,99,235,.18)',color:'#93c5fd',fontSize:'13px',fontWeight:600}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{animation:'spin .7s linear infinite'}}>
                  <circle cx="8" cy="8" r="6" stroke="rgba(147,197,253,.30)" strokeWidth="2" fill="none"/>
                  <path d="M8 2a6 6 0 016 6" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
                Verifying with server…
              </div>
            ) : (
              <>
                <div id="gis-btn"/>
                <button className="lp-google" id="googleBtn" onClick={signInWithGoogle}>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            {authError && (
              <div style={{display:'flex',alignItems:'flex-start',gap:'8px',padding:'10px 14px',
                borderRadius:'10px',background:'rgba(225,29,72,.10)',
                border:'1px solid rgba(225,29,72,.22)',color:'#fda4af',fontSize:'12px',lineHeight:1.5}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,marginTop:'1px'}}>
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" fill="none"/>
                  <line x1="7" y1="4.5" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="7" cy="9.5" r=".7" fill="currentColor"/>
                </svg>
                {authError}
              </div>
            )}

            <div className="lp-notice" id="configNotice">
              Configure Google Client ID in Login.jsx to enable real Google sign-in.
            </div>

            <div className="lp-terms">
              By signing in you agree to our Terms of Service and Privacy Policy.<br/>
              Your data is never shared with third parties.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
