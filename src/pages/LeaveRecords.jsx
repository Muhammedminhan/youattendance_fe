import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';

const TYPE_META = {
  'Annual Leave': { color:'#2563EB', rgb:'37,99,235',  bg:'linear-gradient(135deg,#2563EB,#1E40AF)', label:'Annual'   },
  'Sick Leave':   { color:'#E11D48', rgb:'225,29,72',  bg:'linear-gradient(135deg,#E11D48,#9F1239)', label:'Sick'     },
  'Emergency':    { color:'#D97706', rgb:'217,119,6',  bg:'linear-gradient(135deg,#D97706,#92400E)', label:'Emergency'},
  'WFH':          { color:'#059669', rgb:'5,150,105',  bg:'linear-gradient(135deg,#059669,#047857)', label:'WFH'      },
  'Unpaid':       { color:'#7C3AED', rgb:'124,58,237', bg:'linear-gradient(135deg,#7C3AED,#6D28D9)', label:'Unpaid'   },
};

function typeMeta(type) { return TYPE_META[type] || TYPE_META['Annual Leave']; }

const ON_LEAVE_TODAY = [
  { name: 'Sarah Johnson', type: 'Annual Leave' },
  { name: 'James Chen',    type: 'Sick Leave'   },
  { name: 'Nadia Khalil',  type: 'Annual Leave' },
  { name: 'Tom Eriksen',   type: 'Emergency'    },
  { name: 'Fiona Murphy',  type: 'Annual Leave' },
  { name: 'Arjun Mehta',   type: 'WFH'         },
  { name: 'Chen Wei',      type: 'Sick Leave'   },
  { name: 'Layla Ahmed',   type: 'Annual Leave' },
];

const RECORDS = [
  { employee: 'Sarah Johnson',      type: 'Annual Leave', from: '24 Jun 2026', to: '28 Jun 2026', days: 5,  status: 'Active'    },
  { employee: 'James Chen',         type: 'Sick Leave',   from: '30 Jun 2026', to: '2 Jul 2026',  days: 3,  status: 'Active'    },
  { employee: 'Nadia Khalil',       type: 'Annual Leave', from: '1 Jul 2026',  to: '5 Jul 2026',  days: 5,  status: 'Active'    },
  { employee: 'Tom Eriksen',        type: 'Emergency',    from: '2 Jul 2026',  to: '2 Jul 2026',  days: 1,  status: 'Active'    },
  { employee: 'Priya Sharma',       type: 'Annual Leave', from: '20 Jun 2026', to: '24 Jun 2026', days: 5,  status: 'Completed' },
  { employee: 'David Okafor',       type: 'Sick Leave',   from: '18 Jun 2026', to: '19 Jun 2026', days: 2,  status: 'Completed' },
  { employee: 'Lisa Park',          type: 'Annual Leave', from: '15 Jun 2026', to: '20 Jun 2026', days: 6,  status: 'Completed' },
  { employee: 'Ravi Patel',         type: 'WFH',          from: '10 Jun 2026', to: '11 Jun 2026', days: 2,  status: 'Completed' },
  { employee: 'Amira Hassan',       type: 'Emergency',    from: '5 Jun 2026',  to: '5 Jun 2026',  days: 1,  status: 'Completed' },
  { employee: 'Mohammed Al Rashid', type: 'Annual Leave', from: '1 Jun 2026',  to: '5 Jun 2026',  days: 5,  status: 'Completed' },
];

function Avatar({ name, color }) {
  return (
    <div style={{width:'36px',height:'36px',borderRadius:'10px',background:color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#fff',fontWeight:800,fontSize:'13px',boxShadow:`0 3px 10px ${color}55`}}>
      {name[0]}
    </div>
  );
}

export default function LeaveRecords() {
  const [search, setSearch] = useState('');
  const { isLight } = useTheme();

  const filtered = RECORDS.filter(r =>
    !search || r.employee.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="main">
      <style>{`
        @keyframes livePulse{0%{box-shadow:0 0 0 0 var(--pulse-c,.4)}70%{box-shadow:0 0 0 7px transparent}100%{box-shadow:0 0 0 0 transparent}}
        .ol-dot{animation:livePulse 2s ease-out infinite}

        .on-leave-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-bottom:24px}

        .ol-card{border-radius:14px;padding:13px 15px;display:flex;align-items:center;gap:12px;
          transition:transform .20s cubic-bezier(.34,1.2,.64,1),box-shadow .20s ease}
        .ol-card:hover{transform:translateY(-3px)}

        .ltype-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}

        .records-card{border-radius:20px;padding:22px;margin-bottom:16px}
        .tbl-wrap{overflow-x:auto}

        .search-field{position:relative;display:flex;align-items:center}
        .search-ico{position:absolute;left:11px;pointer-events:none;opacity:.45}

        .status-active{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
          background:rgba(5,150,105,.14);border:1px solid rgba(5,150,105,.28);color:#34d399}
        .status-completed{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
          background:rgba(100,116,139,.10);border:1px solid rgba(100,116,139,.18);color:rgba(160,180,220,.60)}
        html.light .status-active{background:rgba(5,150,105,.10);border-color:rgba(5,150,105,.22);color:#047857}
        html.light .status-completed{background:rgba(100,116,139,.08);border-color:rgba(100,116,139,.18);color:rgba(60,80,120,.55)}
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={{width:'44px',height:'44px',borderRadius:'14px',background:'linear-gradient(135deg,#4F46E5,#3730A3)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(79,70,229,.35)',flexShrink:0}}>
            <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
              <path d="M3 1h5.5L11 3.5V13H3V1z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" fill="none" opacity=".9"/>
              <path d="M8.5 1v3H11" stroke="white" strokeWidth="1.4" strokeLinejoin="round" opacity=".7"/>
              <line x1="5" y1="6" x2="9" y2="6" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity=".9"/>
              <line x1="5" y1="8.5" x2="8" y2="8.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity=".9"/>
              <line x1="5" y1="11" x2="7.5" y2="11" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity=".7"/>
            </svg>
          </div>
          <div>
            <div className="page-title">Leave Records</div>
            <div className="page-sub">All leave requests and current absences</div>
          </div>
        </div>
        <BackButton to="/" label="Back" />
      </div>

      {/* On leave today */}
      <div className="sec-lbl">On Leave Today — {ON_LEAVE_TODAY.length} employees</div>
      <div className="on-leave-grid">
        {ON_LEAVE_TODAY.map((e) => {
          const m = typeMeta(e.type);
          return (
            <div key={e.name} className="ol-card" style={{
              background: isLight ? `rgba(${m.rgb},.07)` : `rgba(${m.rgb},.10)`,
              border: `1px solid rgba(${m.rgb},${isLight?'.16':'.24'})`,
              borderLeft: `3px solid ${m.color}`,
              boxShadow: `0 2px 12px rgba(${m.rgb},.12)`,
            }}>
              {/* Pulsing live dot */}
              <div className="ol-dot" style={{
                width:'10px',height:'10px',borderRadius:'50%',flexShrink:0,
                background:m.color,
                '--pulse-c': `rgba(${m.rgb},.40)`,
                boxShadow:`0 0 0 3px rgba(${m.rgb},.22)`,
              }}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'13px',fontWeight:700,color:isLight?'rgba(15,23,42,.88)':'rgba(220,230,255,.90)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {e.name}
                </div>
                <div style={{fontSize:'11px',marginTop:'3px',color:m.color,fontWeight:600}}>
                  {e.type}
                </div>
              </div>
              {/* Type icon badge */}
              <div style={{width:'28px',height:'28px',borderRadius:'8px',background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 2px 8px rgba(${m.rgb},.30)`}}>
                <TypeIcon type={e.type} />
              </div>
            </div>
          );
        })}
      </div>

      {/* All Records table */}
      <div className="records-card g">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'14px',marginBottom:'18px',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div className="sec-lbl" style={{marginBottom:0}}>All Records</div>
            <div style={{fontSize:'11px',fontWeight:700,padding:'2px 9px',borderRadius:'20px',
              background:isLight?'rgba(37,99,235,.08)':'rgba(37,99,235,.14)',
              border:`1px solid rgba(37,99,235,${isLight?'.14':'.26'})`,
              color:isLight?'#1D4ED8':'#93c5fd'}}>
              {filtered.length}
            </div>
          </div>
          <div className="search-field">
            <svg className="search-ico" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="search-inp"
              placeholder="Search employee or type…"
              style={{paddingLeft:'30px',maxWidth:'240px'}}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const m = typeMeta(r.type);
                return (
                  <tr key={r.from + r.employee}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <Avatar name={r.employee} color={m.color} />
                        <span style={{fontWeight:600}}>{r.employee}</span>
                      </div>
                    </td>
                    <td>
                      <span className="ltype-pill" style={{
                        background:`rgba(${m.rgb},${isLight?'.08':'.13'})`,
                        border:`1px solid rgba(${m.rgb},${isLight?'.18':'.28'})`,
                        color: isLight ? m.color : lightenColor(m.rgb),
                      }}>
                        <span style={{width:'6px',height:'6px',borderRadius:'50%',background:m.color,display:'inline-block',flexShrink:0}}/>
                        {r.type}
                      </span>
                    </td>
                    <td style={{color:isLight?'rgba(30,40,80,.60)':'rgba(160,175,220,.55)',fontVariantNumeric:'tabular-nums'}}>{r.from}</td>
                    <td style={{color:isLight?'rgba(30,40,80,.60)':'rgba(160,175,220,.55)',fontVariantNumeric:'tabular-nums'}}>{r.to}</td>
                    <td>
                      <span style={{fontWeight:700,color:isLight?'rgba(20,30,70,.75)':'rgba(200,215,255,.80)',fontVariantNumeric:'tabular-nums'}}>
                        {r.days}d
                      </span>
                    </td>
                    <td>
                      {r.status === 'Active'
                        ? <span className="status-active">
                            <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#10b981',display:'inline-block'}}/>
                            Active
                          </span>
                        : <span className="status-completed">Completed</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function lightenColor(rgb) {
  const map = {
    '37,99,235':  '#93c5fd',
    '225,29,72':  '#fda4af',
    '217,119,6':  '#fcd34d',
    '5,150,105':  '#6ee7b7',
    '124,58,237': '#c4b5fd',
  };
  return map[rgb] || '#c9d1d9';
}

function TypeIcon({ type }) {
  const s = { width:'14px', height:'14px', stroke:'white', strokeWidth:1.6, fill:'none', opacity:.92 };
  if (type === 'Annual Leave') return (
    <svg viewBox="0 0 16 16" style={s}>
      <rect x="1.5" y="3.5" width="13" height="11" rx="2" strokeWidth="1.4"/>
      <path d="M1.5 7.5h13" strokeWidth="1.1" opacity=".5"/>
      <line x1="5" y1="1.5" x2="5" y2="5.5" strokeLinecap="round"/>
      <line x1="11" y1="1.5" x2="11" y2="5.5" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="1.5" fill="white" stroke="none" opacity=".85"/>
    </svg>
  );
  if (type === 'Sick Leave') return (
    <svg viewBox="0 0 16 16" style={s}>
      <circle cx="8" cy="8" r="6" strokeWidth="1.4"/>
      <line x1="8" y1="5" x2="8" y2="11" strokeLinecap="round"/>
      <line x1="5" y1="8" x2="11" y2="8" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'Emergency') return (
    <svg viewBox="0 0 16 16" style={s}>
      <path d="M8 2l6 11H2L8 2z" strokeLinejoin="round" strokeWidth="1.4"/>
      <line x1="8" y1="6.5" x2="8" y2="9.5" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r=".8" fill="white" stroke="none" opacity=".85"/>
    </svg>
  );
  if (type === 'WFH') return (
    <svg viewBox="0 0 16 16" style={s}>
      <path d="M2 8L8 2l6 6" strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.4"/>
      <path d="M4 8v5h3v-3h2v3h3V8" strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.3"/>
    </svg>
  );
  return (
    <svg viewBox="0 0 16 16" style={s}>
      <rect x="2" y="4" width="12" height="9" rx="1.5" strokeWidth="1.4"/>
      <path d="M5 4V3a1 1 0 012 0v1M9 4V3a1 1 0 012 0v1" strokeLinecap="round"/>
    </svg>
  );
}
