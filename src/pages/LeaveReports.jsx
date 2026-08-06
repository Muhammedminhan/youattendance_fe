import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const TYPE_META = {
  Annual:    { color:'#2563EB', rgb:'37,99,235',  bar:'linear-gradient(90deg,#2563EB,#60a5fa)' },
  Sick:      { color:'#E11D48', rgb:'225,29,72',  bar:'linear-gradient(90deg,#E11D48,#fb7185)' },
  Emergency: { color:'#D97706', rgb:'217,119,6',  bar:'linear-gradient(90deg,#D97706,#fbbf24)' },
  WFH:       { color:'#059669', rgb:'5,150,105',  bar:'linear-gradient(90deg,#059669,#34d399)' },
  Unpaid:    { color:'#7C3AED', rgb:'124,58,237', bar:'linear-gradient(90deg,#7C3AED,#a78bfa)' },
};

/* Days badge: rose >10, amber 5-10, cobalt <5 */
function daysBadge(daysStr, isLight) {
  const n = parseInt(daysStr);
  let rgb, label;
  if (n >= 10)      { rgb = '225,29,72';  label = daysStr; }
  else if (n >= 5)  { rgb = '217,119,6';  label = daysStr; }
  else              { rgb = '37,99,235';   label = daysStr; }
  return {
    background: `rgba(${rgb},${isLight?'.09':'.16'})`,
    border:     `1px solid rgba(${rgb},${isLight?'.18':'.28'})`,
    color:      isLight ? `rgb(${rgb})` : lighten(rgb),
  };
}

function lighten(rgb) {
  const m = { '225,29,72':'#fda4af', '217,119,6':'#fcd34d', '37,99,235':'#93c5fd', '124,58,237':'#c4b5fd', '5,150,105':'#6ee7b7' };
  return m[rgb] || '#c9d1d9';
}

const TAB_DATA = {
  week: [
    { name:'Sarah Johnson',      days:'5 days'  },
    { name:'Nadia Khalil',       days:'4 days'  },
    { name:'James Chen',         days:'3 days'  },
  ],
  month: [
    { name:'Lisa Park',          days:'11 days' },
    { name:'Sarah Johnson',      days:'8 days'  },
    { name:'James Chen',         days:'7 days'  },
    { name:'Nadia Khalil',       days:'6 days'  },
    { name:'Mohammed Al Rashid', days:'5 days'  },
  ],
  year: [
    { name:'Lisa Park',          days:'24 days' },
    { name:'James Chen',         days:'19 days' },
    { name:'Sarah Johnson',      days:'12 days' },
    { name:'Ravi Patel',         days:'11 days' },
    { name:'Mohammed Al Rashid', days:'8 days'  },
  ],
};

const TYPE_BREAKDOWN = [
  { key:'Annual',    width:'75%', count:348, pct:'44%' },
  { key:'Sick',      width:'38%', count:176, pct:'22%' },
  { key:'Emergency', width:'20%', count:91,  pct:'11%' },
  { key:'WFH',       width:'30%', count:138, pct:'17%' },
  { key:'Unpaid',    width:'10%', count:44,  pct:'6%'  },
];

const SEVERITY = {
  Critical: { rgb:'225,29,72',  light:'#BE123C', dark:'#fda4af' },
  Low:      { rgb:'217,119,6',  light:'#B45309', dark:'#fcd34d' },
};

const LOW_BALANCE = [
  { name:'Lisa Park',    id:'EMP007', bal:'1 day remaining',  type:'Annual Leave', sev:'Critical' },
  { name:'James Chen',   id:'EMP004', bal:'2 days remaining', type:'Annual Leave', sev:'Low'      },
  { name:'Nadia Khalil', id:'EMP009', bal:'3 days remaining', type:'Sick Leave',   sev:'Low'      },
];

function Avatar({ name, size = 34, color }) {
  return (
    <div style={{width:`${size}px`,height:`${size}px`,borderRadius:`${Math.round(size*.29)}px`,background:color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#fff',fontWeight:800,fontSize:`${Math.round(size*.38)}px`,boxShadow:`0 3px 10px ${color}55`}}>
      {name[0]}
    </div>
  );
}

const AVATAR_COLORS = ['#2563EB','#E11D48','#D97706','#059669','#7C3AED','#0891B2','#4F46E5'];
function avatarColor(name) { let h=0; for(let c of name) h=(h*31+c.charCodeAt(0))%AVATAR_COLORS.length; return AVATAR_COLORS[h]; }

export default function LeaveReports() {
  const [activeTab, setActiveTab] = useState('month');
  const { isLight } = useTheme();

  return (
    <main className="main">
      <style>{`
        .two-col-r{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .rpt-card{border-radius:20px;padding:22px}

        .period-tabs{display:flex;gap:5px}
        .ptab{padding:6px 15px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;border:none;font-family:inherit;transition:all .18s cubic-bezier(.34,1.2,.64,1)}

        .rank-row{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.06)}
        .rank-row:last-child{border-bottom:none}
        html.light .rank-row{border-bottom-color:rgba(0,0,0,.055)}

        .type-row{display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)}
        .type-row:last-child{border-bottom:none}
        html.light .type-row{border-bottom-color:rgba(0,0,0,.055)}
        .type-bar-bg{flex:1;height:7px;border-radius:4px;overflow:hidden}
        .type-bar{height:100%;border-radius:4px;transition:width .5s cubic-bezier(.4,0,.2,1)}

        .low-row{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.06);flex-wrap:wrap}
        .low-row:last-child{border-bottom:none}
        html.light .low-row{border-bottom-color:rgba(0,0,0,.055)}

        @media(max-width:700px){.two-col-r{grid-template-columns:1fr}}
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={{width:'44px',height:'44px',borderRadius:'14px',background:'linear-gradient(135deg,#0891B2,#0E7490)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(14,116,144,.35)',flexShrink:0}}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <polyline points="1,13 5,8 8,11 11,5.5 15,2.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity=".92"/>
              <polyline points="11,2.5 15,2.5 15,6.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity=".92"/>
            </svg>
          </div>
          <div>
            <div className="page-title">Leave Reports</div>
            <div className="page-sub">Analytics, top takers, and balance alerts</div>
          </div>
        </div>
        <Link to="/" className="back-btn">← Back</Link>
      </div>

      <div className="two-col-r" style={{marginBottom:'16px'}}>

        {/* Top Leave Takers */}
        <div className="rpt-card g">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'18px',flexWrap:'wrap',gap:'8px'}}>
            <div className="sec-lbl" style={{marginBottom:0}}>Top Leave Takers</div>
            <div className="period-tabs">
              {['week','month','year'].map(t => {
                const on = activeTab === t;
                return (
                  <button key={t} className="ptab" onClick={() => setActiveTab(t)} style={{
                    background: on ? (isLight?'rgba(37,99,235,.12)':'rgba(37,99,235,.22)') : (isLight?'rgba(0,0,0,.05)':'rgba(255,255,255,.06)'),
                    color: on ? (isLight?'#1D4ED8':'#93c5fd') : (isLight?'rgba(60,80,120,.55)':'rgba(160,180,220,.55)'),
                    border: on ? `1px solid rgba(37,99,235,${isLight?'.22':'.36'})` : '1px solid transparent',
                    boxShadow: on ? '0 2px 8px rgba(37,99,235,.14)' : 'none',
                  }}>
                    {t[0].toUpperCase()+t.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {TAB_DATA[activeTab].map((r, i) => {
            const badge = daysBadge(r.days, isLight);
            const isFirst = i === 0;
            return (
              <div key={r.name} className="rank-row">
                {/* Rank badge */}
                {isFirst
                  ? <div style={{width:'28px',height:'28px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'linear-gradient(135deg,rgba(217,119,6,.40),rgba(245,158,11,.28))',border:'1px solid rgba(251,191,36,.38)',boxShadow:'0 2px 10px rgba(217,119,6,.22)'}}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 13h10M5 13V9l-2-4h10l-2 4v4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="8" cy="3" r="1.5" fill="#fbbf24"/>
                      </svg>
                    </div>
                  : <div style={{width:'28px',height:'28px',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                      background:isLight?'rgba(37,99,235,.07)':'rgba(37,99,235,.12)',
                      border:`1px solid rgba(37,99,235,${isLight?'.12':'.20'})`,
                      color:isLight?'#2563EB':'#93c5fd',fontSize:'11px',fontWeight:800}}>
                      {i+1}
                    </div>
                }
                <Avatar name={r.name} size={32} color={avatarColor(r.name)} />
                <span style={{fontSize:'13px',fontWeight:700,color:isLight?'rgba(15,23,42,.82)':'rgba(200,215,255,.88)',flex:1}}>
                  {r.name}
                </span>
                <span style={{...badge,display:'inline-flex',alignItems:'center',padding:'3px 11px',borderRadius:'20px',fontSize:'11px',fontWeight:700,whiteSpace:'nowrap'}}>
                  {r.days}
                </span>
              </div>
            );
          })}
        </div>

        {/* Leave by Type */}
        <div className="rpt-card g">
          <div className="sec-lbl" style={{marginBottom:'14px'}}>Leave by Type — This Year</div>
          {TYPE_BREAKDOWN.map(t => {
            const m = TYPE_META[t.key];
            return (
              <div key={t.key} className="type-row">
                {/* Color swatch */}
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:m.color,flexShrink:0,boxShadow:`0 0 0 3px rgba(${m.rgb},.18)`}}/>
                <span style={{fontSize:'13px',fontWeight:600,color:isLight?'rgba(30,40,80,.70)':'rgba(200,215,255,.75)',width:'82px',flexShrink:0}}>
                  {t.key}
                </span>
                <div className="type-bar-bg" style={{background:isLight?'rgba(0,0,0,.07)':'rgba(255,255,255,.09)'}}>
                  <div className="type-bar" style={{width:t.width,background:m.bar}}/>
                </div>
                <span style={{fontSize:'12px',fontWeight:700,color:isLight?'rgba(30,40,80,.60)':'rgba(180,200,240,.60)',width:'34px',textAlign:'right',flexShrink:0,fontVariantNumeric:'tabular-nums'}}>
                  {t.count}
                </span>
                <span style={{fontSize:'11px',fontWeight:700,color:isLight?'rgba(30,40,80,.38)':'rgba(160,180,220,.40)',width:'32px',textAlign:'right',flexShrink:0}}>
                  {t.pct}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low balance alerts */}
      <div className="rpt-card g">
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'18px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'linear-gradient(135deg,#D97706,#92400E)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 3px 12px rgba(217,119,6,.30)'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2l6 11H2L8 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity=".92"/>
              <line x1="8" y1="6.5" x2="8" y2="9.5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              <circle cx="8" cy="11.5" r=".8" fill="white" opacity=".85"/>
            </svg>
          </div>
          <div className="sec-lbl" style={{marginBottom:0}}>Low Leave Balance Alerts</div>
          <div style={{marginLeft:'auto',fontSize:'11px',fontWeight:700,padding:'2px 9px',borderRadius:'20px',
            background:isLight?'rgba(217,119,6,.09)':'rgba(217,119,6,.16)',
            border:`1px solid rgba(217,119,6,${isLight?'.16':'.28'})`,
            color:isLight?'#B45309':'#fcd34d'}}>
            {LOW_BALANCE.length} alerts
          </div>
        </div>

        {LOW_BALANCE.map((e) => {
          const sev = SEVERITY[e.sev];
          const typeMeta = TYPE_META[e.type.replace(' Leave','').trim()] || TYPE_META.Annual;
          return (
            <div key={e.id} className="low-row">
              <Avatar name={e.name} size={36} color={avatarColor(e.name)} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'13px',fontWeight:700,color:isLight?'rgba(15,23,42,.84)':'rgba(200,215,255,.88)'}}>
                  {e.name}
                </div>
                <div style={{fontSize:'11px',color:isLight?'rgba(60,80,120,.42)':'rgba(160,180,220,.44)',marginTop:'1px'}}>
                  {e.id}
                </div>
              </div>
              <div style={{textAlign:'right',flex:1,minWidth:0}}>
                <div style={{fontSize:'12px',fontWeight:700,color:isLight?`rgb(${sev.rgb})`:`rgba(${sev.rgb},.90)`}}>
                  {e.bal}
                </div>
                <div style={{display:'inline-flex',alignItems:'center',gap:'4px',marginTop:'3px'}}>
                  <span style={{width:'5px',height:'5px',borderRadius:'50%',background:typeMeta.color,display:'inline-block',flexShrink:0}}/>
                  <span style={{fontSize:'11px',color:isLight?'rgba(60,80,120,.45)':'rgba(160,180,220,.45)'}}>{e.type}</span>
                </div>
              </div>
              <span style={{
                display:'inline-flex',alignItems:'center',padding:'4px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:700,whiteSpace:'nowrap',flexShrink:0,
                background:`rgba(${sev.rgb},${isLight?'.09':'.16'})`,
                border:`1px solid rgba(${sev.rgb},${isLight?'.18':'.28'})`,
                color:isLight?`rgb(${sev.rgb})`:sev.dark,
              }}>
                {e.sev}
              </span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
