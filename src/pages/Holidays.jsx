import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function daysUntil(day, mon) {
  const months = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const now = new Date();
  let d = new Date(now.getFullYear(), months[mon], parseInt(day));
  if (d < now) d.setFullYear(d.getFullYear() + 1);
  return Math.ceil((d - now) / 86400000);
}

function daysLabel(n) {
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  return `${n} days away`;
}

/* urgency: rose <7, amber 7-30, cobalt >30 */
function urgencyMeta(n) {
  if (n <= 7)  return { rgb:'225,29,72',  light:'#BE123C', dark:'#fda4af' };
  if (n <= 30) return { rgb:'217,119,6',  light:'#B45309', dark:'#fcd34d' };
  return         { rgb:'37,99,235',   light:'#1D4ED8', dark:'#93c5fd' };
}

const UPCOMING = [
  { day:'14', mon:'Jul', name:'Bastille Day',        loc:'All locations', type:'Public',     color:'linear-gradient(135deg,#2563EB,#1E40AF)', rgb:'37,99,235'   },
  { day:'15', mon:'Aug', name:'Independence Day',    loc:'Dubai office',  type:'Public',     color:'linear-gradient(135deg,#059669,#047857)', rgb:'5,150,105'   },
  { day:'25', mon:'Aug', name:'Summer Bank Holiday', loc:'UK office',     type:'Restricted', color:'linear-gradient(135deg,#D97706,#92400E)', rgb:'217,119,6'   },
  { day:'23', mon:'Sep', name:'National Day',        loc:'All locations', type:'Public',     color:'linear-gradient(135deg,#0891B2,#0E7490)', rgb:'14,116,144'  },
  { day:'25', mon:'Dec', name:'Christmas Day',       loc:'All locations', type:'Public',     color:'linear-gradient(135deg,#7C3AED,#6D28D9)', rgb:'124,58,237'  },
];

const PAST = [
  { day:'01', mon:'Jan', name:"New Year's Day",      loc:'All locations' },
  { day:'18', mon:'Apr', name:'Good Friday',         loc:'UK office'     },
  { day:'26', mon:'May', name:'Spring Bank Holiday', loc:'UK office'     },
];

export default function Holidays() {
  const { isLight } = useTheme();

  return (
    <main className="main">
      <style>{`
        .hlist{display:flex;flex-direction:column;gap:8px}

        .hi{display:flex;align-items:center;gap:16px;padding:14px 16px;border-radius:14px;
          border-left:3px solid transparent;transition:background .18s,border-left-color .18s,transform .20s cubic-bezier(.34,1.2,.64,1)}
        .hi:hover{transform:translateX(3px)}

        .hbadge{width:52px;height:52px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
        .hday{font-size:18px;font-weight:800;color:#fff;line-height:1}
        .hmon{font-size:9px;font-weight:700;color:rgba(255,255,255,.78);text-transform:uppercase;letter-spacing:.06em;margin-top:2px}

        .holidays-card{border-radius:20px;padding:22px;margin-bottom:16px}
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={{width:'44px',height:'44px',borderRadius:'14px',background:'linear-gradient(135deg,#7C3AED,#6D28D9)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(124,58,237,.35)',flexShrink:0}}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="3.5" width="13" height="11" rx="2" stroke="white" strokeWidth="1.5" fill="none" opacity=".9"/>
              <path d="M1.5 7.5h13" stroke="white" strokeWidth="1.2" opacity=".45"/>
              <line x1="5" y1="1.5" x2="5" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".9"/>
              <line x1="11" y1="1.5" x2="11" y2="5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".9"/>
              <circle cx="5.5" cy="11" r="1.2" fill="white" opacity=".80"/>
              <circle cx="8" cy="11" r="1.2" fill="white" opacity=".80"/>
              <circle cx="10.5" cy="11" r="1.2" fill="white" opacity=".80"/>
            </svg>
          </div>
          <div>
            <div className="page-title">Holidays</div>
            <div className="page-sub">Upcoming &amp; past public holidays</div>
          </div>
        </div>
        <Link to="/" className="back-btn">← Back</Link>
      </div>

      {/* Upcoming */}
      <div className="holidays-card g">
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'18px'}}>
          <div className="sec-lbl" style={{marginBottom:0}}>Upcoming Holidays</div>
          <div style={{fontSize:'11px',fontWeight:700,padding:'2px 9px',borderRadius:'20px',
            background:isLight?'rgba(124,58,237,.08)':'rgba(124,58,237,.16)',
            border:`1px solid rgba(124,58,237,${isLight?'.14':'.28'})`,
            color:isLight?'#6D28D9':'#c4b5fd'}}>
            {UPCOMING.length}
          </div>
        </div>
        <div className="hlist">
          {UPCOMING.map((h) => {
            const n   = daysUntil(h.day, h.mon);
            const urg = urgencyMeta(n);
            const isRestricted = h.type === 'Restricted';
            return (
              <div key={h.name} className="hi" style={{
                background: isLight ? `rgba(${h.rgb},.05)` : `rgba(${h.rgb},.07)`,
                border: `1px solid rgba(${h.rgb},${isLight?'.10':'.14'})`,
                borderLeft: `3px solid rgba(${h.rgb},.70)`,
              }}>
                {/* Date badge */}
                <div className="hbadge" style={{
                  background: h.color,
                  boxShadow: `0 4px 14px rgba(${h.rgb},.32)`,
                }}>
                  <span className="hday">{h.day}</span>
                  <span className="hmon">{h.mon}</span>
                </div>

                {/* Name + location */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'14px',fontWeight:700,color:isLight?'rgba(15,23,42,.88)':'rgba(220,230,255,.90)',marginBottom:'3px'}}>
                    {h.name}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:isLight?'rgba(60,80,120,.50)':'rgba(160,180,230,.45)'}}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{flexShrink:0,opacity:.7}}>
                      <path d="M6 1a3.5 3.5 0 013.5 3.5c0 2.5-3.5 6.5-3.5 6.5S2.5 7 2.5 4.5A3.5 3.5 0 016 1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                      <circle cx="6" cy="4.5" r="1.2" fill="currentColor" opacity=".7"/>
                    </svg>
                    {h.loc}
                  </div>
                </div>

                {/* Days away chip */}
                <span style={{
                  fontSize:'11px',fontWeight:700,whiteSpace:'nowrap',marginLeft:'8px',
                  padding:'3px 10px',borderRadius:'20px',
                  background:`rgba(${urg.rgb},${isLight?'.08':'.14'})`,
                  border:`1px solid rgba(${urg.rgb},${isLight?'.16':'.26'})`,
                  color:isLight?urg.light:urg.dark,
                }}>
                  {daysLabel(n)}
                </span>

                {/* Public / Restricted type badge */}
                <span style={{
                  fontSize:'11px',fontWeight:700,whiteSpace:'nowrap',marginLeft:'6px',
                  padding:'3px 10px',borderRadius:'20px',
                  background: isRestricted
                    ? (isLight?'rgba(217,119,6,.09)':'rgba(217,119,6,.16)')
                    : (isLight?'rgba(37,99,235,.08)':'rgba(37,99,235,.14)'),
                  border: isRestricted
                    ? `1px solid rgba(217,119,6,${isLight?'.18':'.28'})`
                    : `1px solid rgba(37,99,235,${isLight?'.16':'.26'})`,
                  color: isRestricted
                    ? (isLight?'#B45309':'#fcd34d')
                    : (isLight?'#1D4ED8':'#93c5fd'),
                }}>
                  {h.type}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past */}
      <div className="holidays-card g">
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'18px'}}>
          <div className="sec-lbl" style={{marginBottom:0}}>Past Holidays — 2026</div>
          <div style={{fontSize:'11px',fontWeight:700,padding:'2px 9px',borderRadius:'20px',
            background:isLight?'rgba(100,116,139,.08)':'rgba(100,116,139,.12)',
            border:`1px solid rgba(100,116,139,${isLight?'.14':'.20'})`,
            color:isLight?'rgba(60,80,120,.55)':'rgba(160,180,220,.55)'}}>
            {PAST.length}
          </div>
        </div>
        <div className="hlist">
          {PAST.map((h) => (
            <div key={h.name} className="hi" style={{
              background: isLight?'rgba(100,116,139,.05)':'rgba(100,116,139,.07)',
              border: `1px solid rgba(100,116,139,${isLight?'.09':'.13'})`,
              borderLeft: '3px solid rgba(100,116,139,.25)',
              opacity: .72,
            }}>
              <div className="hbadge" style={{
                background:'linear-gradient(135deg,#475569,#334155)',
                boxShadow:'0 4px 12px rgba(0,0,0,.18)',
              }}>
                <span className="hday">{h.day}</span>
                <span className="hmon">{h.mon}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'14px',fontWeight:700,color:isLight?'rgba(15,23,42,.65)':'rgba(180,195,230,.65)',marginBottom:'3px'}}>
                  {h.name}
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:isLight?'rgba(60,80,120,.40)':'rgba(140,160,200,.38)'}}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{flexShrink:0,opacity:.6}}>
                    <path d="M6 1a3.5 3.5 0 013.5 3.5c0 2.5-3.5 6.5-3.5 6.5S2.5 7 2.5 4.5A3.5 3.5 0 016 1z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <circle cx="6" cy="4.5" r="1.2" fill="currentColor" opacity=".7"/>
                  </svg>
                  {h.loc}
                </div>
              </div>
              <span style={{
                fontSize:'11px',fontWeight:700,padding:'3px 10px',borderRadius:'20px',
                background:isLight?'rgba(100,116,139,.09)':'rgba(100,116,139,.14)',
                border:`1px solid rgba(100,116,139,${isLight?'.14':'.22'})`,
                color:isLight?'rgba(60,80,120,.50)':'rgba(150,168,210,.50)',
              }}>
                Public
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
