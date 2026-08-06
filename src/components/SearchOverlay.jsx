import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMPS } from '../data/employees';
import { useTheme } from '../context/ThemeContext';
import { useSearch } from '../context/SearchContext';

const EMP_LIST = Object.values(EMPS);
const AVATAR_COLORS = ['#2563EB','#E11D48','#D97706','#059669','#7C3AED','#0891B2','#4F46E5'];
function avatarColor(name) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

const STATUS_CHIP = {
  'On Leave':    { bg:'rgba(225,29,72,.12)',  textL:'#BE123C', textD:'#fda4af' },
  'Low Balance': { bg:'rgba(217,119,6,.10)',  textL:'#B45309', textD:'#fcd34d' },
  'Active':      { bg:'rgba(5,150,105,.10)',  textL:'#047857', textD:'#6ee7b7' },
};

const PAGES = [
  { label:'Dashboard',     path:'/',              sub:'Overview & charts',
    icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity=".85"/><rect x="8" y="1" width="5" height="5" rx="1.2" fill="currentColor" opacity=".85"/><rect x="1" y="8" width="5" height="5" rx="1.2" fill="currentColor" opacity=".85"/><rect x="8" y="8" width="5" height="5" rx="1.2" fill="currentColor" opacity=".85"/></svg> },
  { label:'Employees',     path:'/employees',     sub:'Browse all staff',
    icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/><circle cx="10" cy="4.5" r="1.6" stroke="currentColor" strokeWidth="1.2" fill="none" opacity=".6"/><path d="M11.5 12c0-1.76-1.02-3.26-2.5-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".6"/></svg> },
  { label:'Leave Records', path:'/leave-records', sub:'Active & past leaves',
    icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none"/><line x1="4.5" y1="5.5" x2="9.5" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="4.5" y1="7.5" x2="9.5" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><line x1="4.5" y1="9.5" x2="7.5" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  { label:'Leave Reports', path:'/leave-reports', sub:'Analytics & stats',
    icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="7.5" width="2.5" height="5.5" rx="1" fill="currentColor" opacity=".6"/><rect x="5" y="4.5" width="2.5" height="8.5" rx="1" fill="currentColor" opacity=".8"/><rect x="9" y="1.5" width="2.5" height="11.5" rx="1" fill="currentColor"/></svg> },
  { label:'Holidays',      path:'/holidays',      sub:'Public & restricted',
    icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M1.5 6h11" stroke="currentColor" strokeWidth="1" opacity=".5"/><line x1="4.5" y1="1" x2="4.5" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="9.5" y1="1" x2="9.5" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { label:'Alerts',        path:'/alerts',        sub:'Notifications',
    icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5a4 4 0 014 4v2.5l1 1.5H2L3 8V5.5a4 4 0 014-4z" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M5.5 11.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg> },
  { label:'Compare',       path:'/compare',       sub:'Side-by-side view',
    icon:<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="5" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3" fill="none"/><rect x="8" y="3" width="5" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.3" fill="none"/><line x1="6.5" y1="7" x2="7.5" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
];

export default function SearchOverlay() {
  const { open, closeSearch } = useSearch();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef();
  const listRef = useRef();
  const navigate = useNavigate();
  const { isLight } = useTheme();

  function close() { closeSearch(); setQuery(''); setCursor(0); }

  useEffect(() => {
    if (open) { setQuery(''); setCursor(0); setTimeout(() => inputRef.current?.focus(), 40); }
  }, [open]);

  const q = query.trim().toLowerCase();
  const filteredPages = q
    ? PAGES.filter(p => p.label.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q))
    : PAGES;
  const filteredEmps = EMP_LIST.filter(e =>
    !q || e.name.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q) || e.id.toLowerCase().includes(q)
  );

  const sections = [];
  if (filteredPages.length) sections.push({ title: q ? 'Pages' : 'Quick Navigation', items: filteredPages.map(p => ({ ...p, _type:'page' })) });
  if (filteredEmps.length)  sections.push({ title: 'Employees',  items: filteredEmps.map(e => ({ ...e, path:`/employees/${e.id}`, label:e.name, _type:'emp' })) });

  const flat = sections.flatMap(s => s.items);
  const clampedCursor = Math.min(cursor, flat.length - 1);

  function go(item) {
    navigate(item.path);
    close();
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, flat.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { if (flat[clampedCursor]) go(flat[clampedCursor]); }
  }

  useEffect(() => {
    if (listRef.current) {
      const active = listRef.current.querySelector('[data-active="true"]');
      active?.scrollIntoView({ block:'nearest' });
    }
  }, [clampedCursor]);

  /* token shortcuts */
  const surface = isLight ? '#ffffff'            : '#161b22';
  const border  = isLight ? '#e2e8f0'            : '#30363d';
  const textPri = isLight ? 'rgba(15,23,42,.88)' : '#e6edf3';
  const textSub = isLight ? 'rgba(60,80,120,.50)':'#8b949e';
  const inputBg = isLight ? '#f8fafc'            : '#0d1117';

  if (!open) return null;

  let globalIdx = 0;

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:900,display:'flex',alignItems:'flex-start',justifyContent:'center',
        paddingTop:'14vh',background:'rgba(1,4,9,.60)',backdropFilter:'blur(6px)'}}
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      <style>{`
        @keyframes cmdSlideIn {
          from { opacity:0; transform:scale(.96) translateY(-8px); }
          to   { opacity:1; transform:scale(1)   translateY(0);    }
        }
        .cmd-item { display:flex; align-items:center; gap:11px; padding:9px 14px; border-radius:10px;
          cursor:pointer; transition:background .10s; }
        .cmd-item:hover  { background:${isLight?'rgba(37,99,235,.07)':'rgba(37,99,235,.10)'}; }
        .cmd-item[data-active="true"] {
          background:${isLight?'rgba(37,99,235,.10)':'rgba(37,99,235,.14)'};
          outline:1px solid rgba(37,99,235,.22);
        }
      `}</style>

      <div style={{
        background:surface, border:`1px solid ${border}`, borderRadius:'18px',
        width:'560px', maxWidth:'94vw',
        boxShadow: isLight
          ? '0 24px 64px rgba(0,0,0,.14), 0 2px 8px rgba(37,99,235,.08)'
          : '0 24px 80px rgba(0,0,0,.70), 0 2px 8px rgba(37,99,235,.12)',
        overflow:'hidden',
        animation:'cmdSlideIn .18s cubic-bezier(.34,1.2,.64,1)',
      }}>

        {/* Search input */}
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'14px 16px',
          borderBottom:`1px solid ${border}`}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,color:textSub}}>
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" fill="none"/>
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search employees, pages…"
            style={{flex:1, background:'none', border:'none', outline:'none',
              color:textPri, fontSize:'14px', fontFamily:'inherit', fontWeight:500}}
          />
          <kbd style={{
            padding:'2px 7px', borderRadius:'6px', fontSize:'10px', fontWeight:700,
            background:isLight?'rgba(15,23,42,.07)':'rgba(255,255,255,.08)',
            border:`1px solid ${border}`, color:textSub, letterSpacing:'.04em',
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{maxHeight:'380px', overflowY:'auto', padding:'8px 8px'}}>
          {flat.length === 0 && (
            <div style={{textAlign:'center', padding:'32px 0', color:textSub, fontSize:'13px'}}>
              No results for "{query}"
            </div>
          )}

          {sections.map(section => {
            return (
              <div key={section.title} style={{marginBottom:'4px'}}>
                <div style={{fontSize:'10px', fontWeight:700, color:textSub,
                  textTransform:'uppercase', letterSpacing:'.07em',
                  padding:'6px 14px 4px'}}>
                  {section.title}
                </div>
                {section.items.map(item => {
                  const idx = globalIdx++;
                  const isActive = idx === clampedCursor;
                  const sc = item._type === 'emp' ? STATUS_CHIP[item.status] : null;

                  return (
                    <div
                      key={item._type + item.path}
                      className="cmd-item"
                      data-active={isActive ? 'true' : 'false'}
                      onClick={() => go(item)}
                      onMouseEnter={() => setCursor(idx)}
                    >
                      {/* Icon / Avatar */}
                      {item._type === 'page' ? (
                        <div style={{width:'30px',height:'30px',borderRadius:'9px',flexShrink:0,
                          background:isLight?'rgba(37,99,235,.09)':'rgba(37,99,235,.14)',
                          color:isLight?'#1D4ED8':'#93c5fd',
                          display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {item.icon}
                        </div>
                      ) : (
                        <div style={{width:'30px',height:'30px',borderRadius:'9px',flexShrink:0,
                          background:`linear-gradient(135deg,${avatarColor(item.name)},${avatarColor(item.name)}cc)`,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:'11px',fontWeight:800,color:'#fff'}}>
                          {item.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
                        </div>
                      )}

                      {/* Label + sub */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'13px',fontWeight:600,color:textPri,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {item.label}
                        </div>
                        <div style={{fontSize:'11px',color:textSub,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {item._type === 'emp' ? item.dept : item.sub}
                        </div>
                      </div>

                      {/* Status chip for employees */}
                      {sc && (
                        <span style={{fontSize:'10px',fontWeight:700,padding:'2px 8px',borderRadius:'20px',
                          background:sc.bg,
                          color:isLight?sc.textL:sc.textD,
                          flexShrink:0,whiteSpace:'nowrap'}}>
                          {item.status}
                        </span>
                      )}

                      {/* Arrow hint */}
                      {isActive && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{flexShrink:0,color:isLight?'#1D4ED8':'#93c5fd'}}>
                          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{display:'flex',alignItems:'center',gap:'14px',padding:'10px 16px',
          borderTop:`1px solid ${border}`,fontSize:'10px',color:textSub,fontWeight:600}}>
          <span style={{display:'flex',alignItems:'center',gap:'4px'}}>
            <kbd style={{padding:'1px 5px',borderRadius:'4px',background:isLight?'rgba(15,23,42,.07)':'rgba(255,255,255,.08)',border:`1px solid ${border}`}}>↑</kbd>
            <kbd style={{padding:'1px 5px',borderRadius:'4px',background:isLight?'rgba(15,23,42,.07)':'rgba(255,255,255,.08)',border:`1px solid ${border}`}}>↓</kbd>
            navigate
          </span>
          <span style={{display:'flex',alignItems:'center',gap:'4px'}}>
            <kbd style={{padding:'1px 5px',borderRadius:'4px',background:isLight?'rgba(15,23,42,.07)':'rgba(255,255,255,.08)',border:`1px solid ${border}`}}>↵</kbd>
            open
          </span>
          <span style={{display:'flex',alignItems:'center',gap:'4px'}}>
            <kbd style={{padding:'1px 5px',borderRadius:'4px',background:isLight?'rgba(15,23,42,.07)':'rgba(255,255,255,.08)',border:`1px solid ${border}`}}>ESC</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
