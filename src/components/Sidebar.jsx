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
        <div className="sb-logo" style={{
          background:isLight?'rgba(255,255,255,.80)':'rgba(255,255,255,.06)',
          border:isLight?'1px solid rgba(210,218,244,.70)':'1px solid rgba(255,255,255,.09)',
          borderRadius:'14px',
          padding:'10px 12px',
          boxShadow:isLight?'0 1px 4px rgba(100,110,200,.08)':'0 2px 10px rgba(0,0,0,.18)',
          backdropFilter:'blur(12px)',
          WebkitBackdropFilter:'blur(12px)',
          marginBottom:'4px',
        }}>
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
          <span className="nav-ico" style={{background:'linear-gradient(135deg,#2563EB,#1E40AF)',boxShadow:'0 3px 10px rgba(29,78,216,.30)'}}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".9"/><rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity=".9"/></svg>
          </span>Dashboard
        </NavLink>

        <NavLink className={navLinkClass} to="/leave-records">
          <span className="nav-ico" style={{background:'linear-gradient(135deg,#4F46E5,#3730A3)',boxShadow:'0 3px 10px rgba(79,70,229,.30)'}}>
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none"><path d="M3 1h5.5L11 3.5V13H3V1z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="none" opacity=".9"/><path d="M8.5 1v3H11" stroke="white" strokeWidth="1.4" strokeLinejoin="round" opacity=".7"/><line x1="5" y1="6" x2="9" y2="6" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity=".9"/><line x1="5" y1="8.5" x2="8" y2="8.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity=".9"/></svg>
          </span>Leave Records
        </NavLink>

        <NavLink className={navLinkClass} to="/leave-reports">
          <span className="nav-ico" style={{background:'linear-gradient(135deg,#0891B2,#0E7490)',boxShadow:'0 3px 10px rgba(14,116,144,.30)'}}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><polyline points="1,13 5,8 8,11 11,5.5 15,2.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/><polyline points="11,2.5 15,2.5 15,6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity=".9"/></svg>
          </span>Leave Reports
        </NavLink>

        <div className="nav-group">Management</div>

        <NavLink className={navLinkClass} to="/employees">
          <span className="nav-ico" style={{background:'linear-gradient(135deg,#059669,#047857)',boxShadow:'0 3px 10px rgba(4,120,87,.30)'}}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" fill="white" opacity=".9"/><path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".9"/><circle cx="12.5" cy="5" r="2" fill="white" opacity=".6"/><path d="M14 14c0-2.21-1.34-4.1-3.2-4.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".6"/></svg>
          </span>Employees
        </NavLink>

        <NavLink className={navLinkClass} to="/holidays">
          <span className="nav-ico" style={{background:'linear-gradient(135deg,#7C3AED,#6D28D9)',boxShadow:'0 3px 10px rgba(124,58,237,.30)'}}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="11" rx="2" stroke="white" strokeWidth="1.5" fill="none" opacity=".9"/><path d="M1.5 7.5h13" stroke="white" strokeWidth="1.2" opacity=".45"/><line x1="5" y1="1.5" x2="5" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".9"/><line x1="11" y1="1.5" x2="11" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".9"/><circle cx="8" cy="11" r="1.5" fill="white" opacity=".85"/></svg>
          </span>Holidays
        </NavLink>

        {/* User profile row — glass card button matching nav items */}
        <div style={{padding:'4px 0 4px',marginTop:'auto'}}>
          <div
            onClick={() => setProfileOpen(true)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setProfileOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Open profile settings"
            className="sb-user-row"
            style={{
              display:'flex',alignItems:'center',gap:'10px',
              padding:'9px 12px',borderRadius:'14px',cursor:'pointer',
              background:isLight?'rgba(255,255,255,.72)':'rgba(255,255,255,.06)',
              border:isLight?'1px solid rgba(210,218,244,.65)':'1px solid rgba(255,255,255,.09)',
              boxShadow:isLight?'0 1px 3px rgba(100,110,200,.07),0 2px 10px rgba(100,110,200,.05)':'0 2px 12px rgba(0,0,0,.18)',
              backdropFilter:'blur(10px)',
              WebkitBackdropFilter:'blur(10px)',
              transition:'all .20s cubic-bezier(.34,1.2,.64,1)',
            }}
          >
            {user?.picture ? (
              <img
                src={getEffectivePicture()}
                alt=""
                style={{width:'34px',height:'34px',borderRadius:'10px',objectFit:'cover',flexShrink:0,boxShadow:'0 2px 8px rgba(0,0,0,.12)'}}
              />
            ) : (
              <div style={{width:'34px',height:'34px',borderRadius:'10px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#fff',fontWeight:700,fontSize:'13px',boxShadow:'0 2px 8px rgba(99,102,241,.35)'}}>
                {user?.name?.[0] || 'U'}
              </div>
            )}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:'12px',fontWeight:700,color:isLight?'rgba(20,24,40,.88)':'#c9d1d9',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {user?.name?.split(' ')[0] || 'User'}
              </div>
              <div style={{fontSize:'10px',color:isLight?'rgba(80,90,130,.52)':'#484f58',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {user?.email || ''}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggleTheme(); }}
              style={{flexShrink:0,width:'28px',height:'28px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center',background:isLight?'rgba(99,102,241,.10)':'rgba(255,255,255,.08)',border:`1px solid ${isLight?'rgba(99,102,241,.20)':'rgba(255,255,255,.10)'}`,transition:'all .15s'}}
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
