import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileModal({ onClose }) {
  const { user, updateUser, logout, getEffectivePicture } = useAuth();
  const { isLight } = useTheme();
  const [name, setName]           = useState(user?.name || '');
  const [previewSrc, setPreviewSrc] = useState(getEffectivePicture());
  const [newFile, setNewFile]     = useState(null);
  const [sizeWarning, setSizeWarning] = useState('');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [nameDirty, setNameDirty] = useState(false);
  const fileRef     = useRef();
  const objectUrlRef = useRef(null);

  const nameError = nameDirty && name.trim().length === 0 ? 'Name cannot be empty.' : '';
  const hasChanges = newFile !== null || name.trim() !== (user?.name || '').trim();

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    setSizeWarning(file.size > 200 * 1024
      ? `Image is ${(file.size / 1024).toFixed(0)} KB — may exceed storage limits. Use a smaller image.`
      : '');
    objectUrlRef.current = URL.createObjectURL(file);
    setPreviewSrc(objectUrlRef.current);
    setNewFile(file);
  }

  function handleSave() {
    if (nameError || !name.trim()) { setNameDirty(true); return; }
    if (!hasChanges) { onClose(); return; }

    setSaving(true);
    const updated = { ...user, name: name.trim() };

    function finish() {
      updateUser(updated);
      setSaving(false);
      setSaved(true);
      setTimeout(onClose, 800);
    }

    if (newFile) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        try { localStorage.setItem('yd-custom-picture', ev.target.result); updated.picture = ev.target.result; }
        catch { /* quota exceeded — skip picture */ }
        finish();
      };
      reader.readAsDataURL(newFile);
    } else {
      finish();
    }
  }

  function handleLogout() { logout(); onClose(); }

  /* Theme tokens */
  const surface  = isLight ? '#ffffff'              : '#161b22';
  const border   = isLight ? '#e2e8f0'              : '#30363d';
  const textPri  = isLight ? 'rgba(15,23,42,.90)'   : '#e6edf3';
  const textSub  = isLight ? 'rgba(60,80,120,.55)'  : '#8b949e';
  const inputBg  = isLight ? '#f8fafc'              : '#0d1117';
  const inputClr = isLight ? 'rgba(15,23,42,.88)'   : '#c9d1d9';
  const roFg     = isLight ? 'rgba(60,80,120,.50)'  : '#6e7681';
  const roBg     = isLight ? '#f1f5f9'              : '#0d1117';
  const roBdr    = isLight ? '#e2e8f0'              : '#21262d';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Profile settings"
      style={{display:'flex',position:'fixed',inset:0,zIndex:500,alignItems:'center',justifyContent:'center',
        background:'rgba(1,4,9,.70)',backdropFilter:'blur(4px)'}}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{background:surface,border:`1px solid ${border}`,borderRadius:'20px',
        width:'380px',maxWidth:'94vw',padding:'28px',position:'relative',
        boxShadow:isLight?'0 24px 64px rgba(0,0,0,.14)':'0 24px 64px rgba(0,0,0,.60)'}}>

        {/* Close */}
        <button onClick={onClose} title="Close"
          style={{position:'absolute',top:'14px',right:'14px',background:'none',border:'none',
            color:textSub,cursor:'pointer',borderRadius:'8px',width:'28px',height:'28px',
            display:'flex',alignItems:'center',justifyContent:'center',transition:'background .15s'}}
          onMouseEnter={e => e.currentTarget.style.background = isLight?'rgba(15,23,42,.07)':'rgba(255,255,255,.07)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'24px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'10px',
            background:'linear-gradient(135deg,#2563EB,#1E40AF)',
            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5.5" r="2.8" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M2 13.5c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div style={{fontSize:'15px',fontWeight:800,color:textPri,letterSpacing:'-.02em'}}>Edit Profile</div>
        </div>

        {/* Avatar */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'10px',marginBottom:'24px'}}>
          <div
            style={{position:'relative',cursor:'pointer',display:'inline-block'}}
            onClick={() => fileRef.current.click()}
            title="Change profile photo"
          >
            <img src={previewSrc} alt="" style={{
              width:'80px',height:'80px',borderRadius:'18px',objectFit:'cover',
              border:`2px solid ${border}`,display:'block'
            }}/>
            {/* Cobalt camera overlay */}
            <div style={{
              position:'absolute',bottom:'-6px',right:'-6px',width:'26px',height:'26px',
              borderRadius:'8px',background:'linear-gradient(135deg,#2563EB,#1E40AF)',
              display:'flex',alignItems:'center',justifyContent:'center',
              border:`2px solid ${surface}`,boxShadow:'0 2px 8px rgba(37,99,235,.40)',
            }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H10l1.5 2H14a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V5a1 1 0 011-1h2.5L6 2z"
                  stroke="white" strokeWidth="1.3" fill="none"/>
                <circle cx="8" cy="8" r="2.2" stroke="white" strokeWidth="1.3" fill="none"/>
              </svg>
            </div>
          </div>
          <div style={{fontSize:'11px',color:textSub}}>Click photo to change (max 200 KB)</div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" style={{display:'none'}} onChange={handleFileChange}/>
          {sizeWarning && (
            <div style={{display:'flex',alignItems:'flex-start',gap:'6px',fontSize:'11px',
              color:isLight?'#B45309':'#fcd34d',textAlign:'left',maxWidth:'280px',lineHeight:1.5,
              background:isLight?'rgba(217,119,6,.07)':'rgba(217,119,6,.10)',
              border:`1px solid rgba(217,119,6,${isLight?'.14':'.22'})`,
              borderRadius:'8px',padding:'7px 10px'}}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,marginTop:'1px'}}>
                <path d="M8 2L14.5 13.5H1.5L8 2z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
                <line x1="8" y1="7" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="12.5" r=".75" fill="currentColor"/>
              </svg>
              {sizeWarning}
            </div>
          )}
        </div>

        {/* Display Name */}
        <div style={{marginBottom:'14px'}}>
          <label style={{fontSize:'11px',fontWeight:700,color:textSub,
            textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:'6px'}}>
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameDirty(true); }}
            onBlur={() => setNameDirty(true)}
            placeholder="Your name"
            maxLength={100}
            style={{
              width:'100%',padding:'10px 14px',borderRadius:'8px',
              background:inputBg,
              border:`1px solid ${nameError ? 'rgba(225,29,72,.55)' : border}`,
              color:inputClr,fontSize:'13px',fontFamily:'inherit',
              outline:'none',boxSizing:'border-box',
              boxShadow: nameError ? '0 0 0 3px rgba(225,29,72,.12)' : 'none',
              transition:'border .15s,box-shadow .15s',
            }}
          />
          {nameError && (
            <div style={{fontSize:'11px',color:isLight?'#BE123C':'#fda4af',marginTop:'5px',
              display:'flex',alignItems:'center',gap:'4px'}}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <line x1="6" y1="3.5" x2="6" y2="6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="6" cy="8.5" r=".65" fill="currentColor"/>
              </svg>
              {nameError}
            </div>
          )}
        </div>

        {/* Email (read-only) */}
        <div style={{marginBottom:'24px'}}>
          <label style={{fontSize:'11px',fontWeight:700,color:textSub,
            textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:'6px'}}>
            Email
            <span style={{marginLeft:'6px',fontWeight:600,fontSize:'10px',
              color:isLight?'rgba(60,80,120,.40)':'rgba(140,160,200,.38)',textTransform:'none',letterSpacing:0}}>
              (read-only)
            </span>
          </label>
          <input
            type="email"
            readOnly
            value={user?.email || ''}
            style={{width:'100%',padding:'10px 14px',borderRadius:'8px',
              background:roBg,border:`1px solid ${roBdr}`,color:roFg,
              fontSize:'13px',fontFamily:'inherit',cursor:'not-allowed',boxSizing:'border-box'}}
          />
        </div>

        {/* Actions */}
        <div style={{display:'flex',gap:'10px'}}>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            style={{
              flex:1,padding:'11px',borderRadius:'10px',border:'none',
              background: saved
                ? 'linear-gradient(135deg,#059669,#047857)'
                : 'linear-gradient(135deg,#2563EB,#1E40AF)',
              color:'#fff',fontSize:'13px',fontWeight:700,fontFamily:'inherit',
              cursor: (saving || saved) ? 'default' : 'pointer',
              opacity: saving ? .75 : 1,
              display:'flex',alignItems:'center',justifyContent:'center',gap:'7px',
              transition:'opacity .15s,background .25s',
            }}>
            {saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7l3.5 3.5 5.5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Saved
              </>
            ) : saving ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{animation:'spin .7s linear infinite'}}>
                  <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,.30)" strokeWidth="1.8" fill="none"/>
                  <path d="M7 1.5a5.5 5.5 0 015.5 5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7.5L5.5 11 12 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Save Changes
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding:'11px 14px',borderRadius:'10px',
              background:isLight?'rgba(225,29,72,.07)':'rgba(225,29,72,.09)',
              border:`1px solid rgba(225,29,72,${isLight?'.16':'.22'})`,
              color:isLight?'#BE123C':'#fda4af',
              fontSize:'13px',fontWeight:700,fontFamily:'inherit',cursor:'pointer',
              display:'flex',alignItems:'center',gap:'6px',
              transition:'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = isLight?'rgba(225,29,72,.12)':'rgba(225,29,72,.15)'}
            onMouseLeave={e => e.currentTarget.style.background = isLight?'rgba(225,29,72,.07)':'rgba(225,29,72,.09)'}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M5.5 3.2A5.5 5.5 0 1010.5 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="8" y1="2" x2="8" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
