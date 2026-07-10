import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ onClose }) {
  const { user, updateUser, logout, getEffectivePicture } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [previewSrc, setPreviewSrc] = useState(getEffectivePicture());
  const [newFile, setNewFile] = useState(null);
  const [sizeWarning, setSizeWarning] = useState('');
  const fileRef = useRef();
  const objectUrlRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Revoke previous object URL to avoid memory leak
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    // Warn if file exceeds 200 KB — localStorage has a 5 MB shared limit
    if (file.size > 200 * 1024) {
      setSizeWarning(`Image is ${(file.size / 1024).toFixed(0)} KB — large photos may exceed storage limits. Use a smaller image.`);
    } else {
      setSizeWarning('');
    }
    // Use object URL for preview (no base64 bloat in memory)
    objectUrlRef.current = URL.createObjectURL(file);
    setPreviewSrc(objectUrlRef.current);
    setNewFile(file);
  }

  function handleSave() {
    const updated = { ...user };
    if (name.trim()) updated.name = name.trim();
    if (newFile) {
      // Read as base64 only at save time — TODO: upload to server instead
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          localStorage.setItem('yd-custom-picture', ev.target.result);
          updated.picture = ev.target.result;
        } catch {
          // localStorage quota exceeded — skip saving picture
        }
        updateUser(updated);
        onClose();
      };
      reader.readAsDataURL(newFile);
      return;
    }
    updateUser(updated);
    onClose();
  }

  function handleLogout() {
    logout();
    onClose();
  }

  return (
    <div
      style={{display:'flex',position:'fixed',inset:0,zIndex:500,alignItems:'center',justifyContent:'center',background:'rgba(1,4,9,.70)',backdropFilter:'blur(4px)'}}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{background:'#161b22',border:'1px solid #30363d',borderRadius:'20px',width:'380px',maxWidth:'94vw',padding:'28px',position:'relative',boxShadow:'0 24px 64px rgba(0,0,0,.60)'}}>
        <button onClick={onClose} style={{position:'absolute',top:'14px',right:'14px',background:'none',border:'none',color:'#484f58',fontSize:'18px',cursor:'pointer',borderRadius:'6px',width:'28px',height:'28px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>

        <div style={{fontSize:'16px',fontWeight:800,color:'#e6edf3',marginBottom:'22px',letterSpacing:'-.02em'}}>Edit Profile</div>

        {/* Avatar */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
          <div style={{position:'relative',cursor:'pointer'}} onClick={() => fileRef.current.click()}>
            <img src={previewSrc} alt="" style={{width:'80px',height:'80px',borderRadius:'18px',objectFit:'cover',border:'2px solid #30363d'}}/>
            <div style={{position:'absolute',bottom:'-6px',right:'-6px',width:'26px',height:'26px',borderRadius:'8px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',border:'2px solid #161b22'}}>✏️</div>
          </div>
          <div style={{fontSize:'11px',color:'#6e7681'}}>Click photo to change (max 200 KB)</div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFileChange}/>
          {sizeWarning && <div style={{fontSize:'11px',color:'#f59e0b',textAlign:'center',maxWidth:'280px',lineHeight:1.5}}>{sizeWarning}</div>}
        </div>

        {/* Name */}
        <div style={{marginBottom:'14px'}}>
          <label style={{fontSize:'11px',fontWeight:700,color:'#8b949e',textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:'6px'}}>Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{width:'100%',padding:'10px 14px',borderRadius:'8px',background:'#0d1117',border:'1px solid #30363d',color:'#c9d1d9',fontSize:'13px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}
          />
        </div>

        {/* Email (read-only) */}
        <div style={{marginBottom:'24px'}}>
          <label style={{fontSize:'11px',fontWeight:700,color:'#8b949e',textTransform:'uppercase',letterSpacing:'.06em',display:'block',marginBottom:'6px'}}>Email</label>
          <input
            type="email"
            readOnly
            value={user?.email || ''}
            style={{width:'100%',padding:'10px 14px',borderRadius:'8px',background:'#0d1117',border:'1px solid #21262d',color:'#6e7681',fontSize:'13px',fontFamily:'inherit',cursor:'not-allowed',boxSizing:'border-box'}}
          />
        </div>

        {/* Actions */}
        <div style={{display:'flex',gap:'10px'}}>
          <button onClick={handleSave} style={{flex:1,padding:'11px',borderRadius:'10px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',color:'#fff',fontSize:'13px',fontWeight:700,fontFamily:'inherit',cursor:'pointer'}}>Save Changes</button>
          <button onClick={handleLogout} style={{padding:'11px 16px',borderRadius:'10px',background:'rgba(239,68,68,.10)',border:'1px solid rgba(239,68,68,.22)',color:'#fca5a5',fontSize:'13px',fontWeight:700,fontFamily:'inherit',cursor:'pointer'}}>⏻ Sign Out</button>
        </div>
      </div>
    </div>
  );
}
