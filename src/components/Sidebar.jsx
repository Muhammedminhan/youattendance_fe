import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import ProfileModal from './ProfileModal';

export default function Sidebar() {
  const { user, getEffectivePicture } = useAuth();
  const { isLight, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinkClass = ({ isActive }) => `nav-a${isActive ? ' on' : ''}`;

  return (
    <>
      <nav className="sidebar">
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-mark" style={{width:'38px',height:'38px',borderRadius:'12px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 4px 14px rgba(99,102,241,.45)'}}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="3" y="14" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="10" fill="#ffffff" letterSpacing="-0.3">YOU</text>
              <polyline points="3,20 6.5,24 13,17" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="18" cy="19" r="1.6" fill="rgba(255,255,255,.85)"/>
              <circle cx="23" cy="19" r="1.6" fill="rgba(255,255,255,.85)"/>
              <circle cx="18" cy="24" r="1.6" fill="rgba(255,255,255,.85)"/>
              <circle cx="23" cy="24" r="1.6" fill="rgba(255,255,255,.85)"/>
            </svg>
          </div>
          <div>
            <div className="sb-logo-text"><span className="logo-you">YOU</span>Attendance</div>
            <div className="sb-logo-sub">HR Dashboard</div>
          </div>
        </div>

        {/* Nav links */}
        <NavLink className={navLinkClass} to="/" end>
          <span className="nav-ico" style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'0 4px 14px rgba(99,102,241,.55)'}}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".9"/></svg>
          </span>Dashboard
        </NavLink>

        <NavLink className={navLinkClass} to="/leave-records">
          <span className="nav-ico" style={{background:'linear-gradient(135deg,#3b82f6,#2563eb)',boxShadow:'0 4px 14px rgba(59,130,246,.40)'}}>
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M3 1h5.5L11 3.5V13H3V1z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="none" opacity=".9"/><path d="M8.5 1v3H11" stroke="white" strokeWidth="1.4" strokeLinejoin="round" opacity=".7"/><line x1="5" y1="6" x2="9" y2="6" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity=".9"/><line x1="5" y1="8.5" x2="8" y2="8.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity=".9"/></svg>
          </span>Leave Records
        </NavLink>

        <NavLink className={navLinkClass} to="/leave-reports">
          <span className="nav-ico" style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',boxShadow:'0 4px 14px rgba(245,158,11,.40)'}}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><polyline points="1,13 5,8 8,11 11,5.5 15,2.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/><polyline points="11,2.5 15,2.5 15,6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/></svg>
          </span>Leave Reports
        </NavLink>

        <div className="nav-group">Management</div>

        <NavLink className={navLinkClass} to="/employees">
          <span className="nav-ico" style={{background:'linear-gradient(135deg,#14b8a6,#0d9488)',boxShadow:'0 4px 14px rgba(20,184,166,.40)'}}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" fill="white" opacity=".9"/><path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".9"/><circle cx="12.5" cy="5" r="2" fill="white" opacity=".6"/><path d="M14 14c0-2.21-1.34-4.1-3.2-4.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".6"/></svg>
          </span>Employees
        </NavLink>

        <NavLink className={navLinkClass} to="/holidays">
          <span className="nav-ico" style={{background:'linear-gradient(135deg,#ec4899,#db2777)',boxShadow:'0 4px 14px rgba(236,72,153,.40)'}}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="11" rx="2" stroke="white" strokeWidth="1.5" fill="none" opacity=".9"/><path d="M1.5 7.5h13" stroke="white" strokeWidth="1.2" opacity=".45"/><line x1="5" y1="1.5" x2="5" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".9"/><line x1="11" y1="1.5" x2="11" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".9"/><circle cx="8" cy="11" r="1.5" fill="white" opacity=".85"/></svg>
          </span>Holidays
        </NavLink>

        {/* User profile row */}
        <div style={{marginTop:'auto',padding:'14px 10px 4px',borderTop:'1px solid #21262d'}}>
          <div
            onClick={() => setProfileOpen(true)}
            style={{display:'flex',alignItems:'center',gap:'10px',padding:'7px 8px',borderRadius:'10px',cursor:'pointer'}}
            className="sb-user-row"
          >
            {user?.picture ? (
              <img
                src={getEffectivePicture()}
                alt=""
                style={{width:'32px',height:'32px',borderRadius:'10px',objectFit:'cover',flexShrink:0}}
              />
            ) : (
              <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#fff',fontWeight:700,fontSize:'13px'}}>
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:'12px',fontWeight:700,color:isLight?'rgba(20,24,40,.88)':'#c9d1d9',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {user?.name?.split(' ')[0] || 'User'}
              </div>
              <div style={{fontSize:'10px',color:isLight?'rgba(80,90,130,.55)':'#484f58',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {user?.email || ''}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
              style={{flexShrink:0,width:'30px',height:'30px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center',background:isLight?'rgba(99,102,241,.10)':'rgba(255,255,255,.08)',border:`1px solid ${isLight?'rgba(99,102,241,.22)':'rgba(255,255,255,.10)'}`,transition:'background .15s'}}
            >
              {isLight ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </nav>

      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </>
  );
}
