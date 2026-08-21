import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';

const TYPE_META = {
  'Earned Leave':           { color:'#2563EB', rgb:'37,99,235',  bar:'linear-gradient(90deg,#2563EB,#60a5fa)' },
  'Sick Leave':             { color:'#E11D48', rgb:'225,29,72',  bar:'linear-gradient(90deg,#E11D48,#fb7185)' },
  'Compensatory Off':       { color:'#059669', rgb:'5,150,105',  bar:'linear-gradient(90deg,#059669,#34d399)' },
  'Restricted Holiday':     { color:'#D97706', rgb:'217,119,6',  bar:'linear-gradient(90deg,#D97706,#fbbf24)' },
  'FOP':                    { color:'#7C3AED', rgb:'124,58,237', bar:'linear-gradient(90deg,#7C3AED,#a78bfa)' },
  'Earned Leave (Trainee)': { color:'#0891B2', rgb:'8,145,178',  bar:'linear-gradient(90deg,#0891B2,#38bdf8)' },
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
  { key:'Earned Leave',           width:'72%', count:334, pct:'40%' },
  { key:'Sick Leave',             width:'38%', count:166, pct:'20%' },
  { key:'Compensatory Off',       width:'27%', count:125, pct:'15%' },
  { key:'Restricted Holiday',     width:'22%', count:100, pct:'12%' },
  { key:'FOP',                    width:'14%', count:66,  pct:'8%'  },
  { key:'Earned Leave (Trainee)', width:'9%',  count:41,  pct:'5%'  },
];

const EMPLOYEE_BY_TYPE = {
  'Earned Leave': [
    { name:'Lisa Park',           id:'EMP007', days:24 },
    { name:'James Chen',          id:'EMP004', days:19 },
    { name:'Sarah Johnson',       id:'EMP002', days:15 },
    { name:'Ravi Patel',          id:'EMP011', days:12 },
    { name:'Mohammed Al Rashid',  id:'EMP005', days:9  },
    { name:'Nadia Khalil',        id:'EMP009', days:8  },
  ],
  'Sick Leave': [
    { name:'Nadia Khalil',        id:'EMP009', days:11 },
    { name:'Sarah Johnson',       id:'EMP002', days:8  },
    { name:'James Chen',          id:'EMP004', days:6  },
    { name:'Ravi Patel',          id:'EMP011', days:4  },
    { name:'Mohammed Al Rashid',  id:'EMP005', days:3  },
  ],
  'Compensatory Off': [
    { name:'Mohammed Al Rashid',  id:'EMP005', days:10 },
    { name:'Ravi Patel',          id:'EMP011', days:7  },
    { name:'Lisa Park',           id:'EMP007', days:5  },
    { name:'James Chen',          id:'EMP004', days:4  },
  ],
  'Restricted Holiday': [
    { name:'Sarah Johnson',       id:'EMP002', days:6  },
    { name:'Nadia Khalil',        id:'EMP009', days:5  },
    { name:'Lisa Park',           id:'EMP007', days:4  },
    { name:'Mohammed Al Rashid',  id:'EMP005', days:3  },
  ],
  'FOP': [
    { name:'James Chen',          id:'EMP004', days:5  },
    { name:'Ravi Patel',          id:'EMP011', days:4  },
    { name:'Sarah Johnson',       id:'EMP002', days:3  },
  ],
  'Earned Leave (Trainee)': [
    { name:'Nadia Khalil',        id:'EMP009', days:4  },
    { name:'Mohammed Al Rashid',  id:'EMP005', days:2  },
  ],
};

const SEVERITY = {
  Critical: { rgb:'225,29,72',  light:'#BE123C', dark:'#fda4af' },
  Low:      { rgb:'217,119,6',  light:'#B45309', dark:'#fcd34d' },
};

const LOW_BALANCE = [
  { name:'Lisa Park',    id:'EMP007', bal:'1 day remaining',  type:'Earned Leave', sev:'Critical' },
  { name:'James Chen',   id:'EMP004', bal:'2 days remaining', type:'Earned Leave', sev:'Low'      },
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

const TYPE_KEYS = Object.keys(TYPE_META);

export default function LeaveReports() {
  const [activeTab, setActiveTab] = useState('month');
  const [activeType, setActiveType] = useState(TYPE_KEYS[0]);
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
        <BackButton to="/" label="Back" />
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

      {/* Leave taken by employees per type */}
      <div className="rpt-card g" style={{marginBottom:'16px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'18px',flexWrap:'wrap'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'linear-gradient(135deg,#4F46E5,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 3px 12px rgba(79,70,229,.30)'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="5" cy="4.5" r="2" fill="white" opacity=".9"/>
              <path d="M1 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".9"/>
              <circle cx="11.5" cy="4.5" r="2" fill="white" opacity=".6"/>
              <path d="M9.5 13c0-2.2 1.8-4 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".6"/>
            </svg>
          </div>
          <div className="sec-lbl" style={{marginBottom:0}}>Leave Taken by Employees</div>
        </div>

        {/* Type tabs */}
        <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'18px'}}>
          {TYPE_KEYS.map(key => {
            const on = activeType === key;
            const m = TYPE_META[key];
            return (
              <button key={key} onClick={() => setActiveType(key)} style={{
                padding:'5px 13px',borderRadius:'20px',fontSize:'11.5px',fontWeight:700,cursor:'pointer',border:'none',fontFamily:'inherit',transition:'all .18s',
                background: on ? `rgba(${m.rgb},.18)` : isLight ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.07)',
                color: on ? (isLight ? `rgb(${m.rgb})` : lighten(m.rgb)) : isLight ? 'rgba(60,80,120,.55)' : 'rgba(160,180,220,.55)',
                border: on ? `1px solid rgba(${m.rgb},.30)` : '1px solid transparent',
                boxShadow: on ? `0 2px 8px rgba(${m.rgb},.18)` : 'none',
              }}>
                <span style={{display:'inline-block',width:'7px',height:'7px',borderRadius:'50%',background:m.color,marginRight:'5px',verticalAlign:'middle'}}/>
                {key}
              </button>
            );
          })}
        </div>

        {/* Employee rows for selected type */}
        {(EMPLOYEE_BY_TYPE[activeType] || []).map((emp, i) => {
          const m = TYPE_META[activeType];
          const maxDays = EMPLOYEE_BY_TYPE[activeType][0].days;
          const barPct = Math.round((emp.days / maxDays) * 100);
          return (
            <div key={emp.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'10px 0',borderBottom:`1px solid ${isLight?'rgba(0,0,0,.055)':'rgba(255,255,255,.06)'}`,..( i === (EMPLOYEE_BY_TYPE[activeType].length-1) && {borderBottom:'none'})}}>
              <div style={{width:'22px',textAlign:'center',fontSize:'11px',fontWeight:700,color:isLight?'rgba(60,80,120,.38)':'rgba(160,180,220,.38)',flexShrink:0}}>
                {i+1}
              </div>
              <Avatar name={emp.name} size={32} color={avatarColor(emp.name)} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'13px',fontWeight:700,color:isLight?'rgba(15,23,42,.82)':'rgba(200,215,255,.88)'}}>
                  {emp.name}
                </div>
                <div style={{fontSize:'11px',color:isLight?'rgba(60,80,120,.42)':'rgba(160,180,220,.44)'}}>{emp.id}</div>
              </div>
              <div style={{width:'120px',flexShrink:0}}>
                <div style={{height:'6px',borderRadius:'3px',background:isLight?'rgba(0,0,0,.07)':'rgba(255,255,255,.09)',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${barPct}%`,background:m.bar,borderRadius:'3px',transition:'width .4s'}}/>
                </div>
              </div>
              <div style={{width:'55px',textAlign:'right',flexShrink:0,fontSize:'12px',fontWeight:700,
                color:isLight?`rgb(${m.rgb})`:lighten(m.rgb)}}>
                {emp.days} {emp.days === 1 ? 'day' : 'days'}
              </div>
            </div>
          );
        })}
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
          const typeMeta = TYPE_META[e.type] || TYPE_META['Earned Leave'];
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
