import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { EMPS, ALL } from '../data/employees';
import { useTheme } from '../context/ThemeContext';
Chart.register(...registerables);

const TYPE_META = {
  'Annual Leave': { color:'#2563EB', rgb:'37,99,235'  },
  'Sick Leave':   { color:'#E11D48', rgb:'225,29,72'  },
  'Emergency':    { color:'#D97706', rgb:'217,119,6'  },
  'WFH':          { color:'#059669', rgb:'5,150,105'  },
  'Unpaid':       { color:'#7C3AED', rgb:'124,58,237' },
};

const MINI_STATS = [
  {
    key:'total', label:'Total Days This Year', sub:'days taken',
    color:'#93c5fd', lightColor:'#1D4ED8', bg:'linear-gradient(135deg,#2563EB,#1E40AF)',
    icon: <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3.5" width="13" height="11" rx="2" stroke="white" strokeWidth="1.4" fill="none"/><path d="M1.5 7.5h13" stroke="white" strokeWidth="1.1" opacity=".5"/><line x1="5" y1="1.5" x2="5" y2="5.5" stroke="white" strokeWidth="1.7" strokeLinecap="round"/><line x1="11" y1="1.5" x2="11" y2="5.5" stroke="white" strokeWidth="1.7" strokeLinecap="round"/></svg>
  },
  {
    key:'remaining', label:'Remaining Balance', sub:'days left',
    color:'#6ee7b7', lightColor:'#047857', bg:'linear-gradient(135deg,#059669,#047857)',
    icon: <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.4"/><polyline points="5.5,8 7.5,10 10.5,6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  },
  {
    key:'streak', label:'Longest Streak', sub:'consecutive days',
    color:'#fda4af', lightColor:'#BE123C', bg:'linear-gradient(135deg,#E11D48,#9F1239)',
    icon: <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M8 2C6 5 4 6.5 4 9a4 4 0 008 0c0-2.5-2-4-4-7z" stroke="white" strokeWidth="1.4" fill="none"/><path d="M6.5 12.5C6.5 11 8 10 8 10s1.5 1 1.5 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
  },
  {
    key:'avg', label:'Avg Per Month', sub:'days / month',
    color:'#fcd34d', lightColor:'#B45309', bg:'linear-gradient(135deg,#D97706,#92400E)',
    icon: <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><polyline points="1.5,12 5,7 8,9.5 11,5 14.5,3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  },
];

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLight } = useTheme();
  const emp = EMPS[id];

  // All hooks must be declared before any conditional return (Rules of Hooks)
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [searchHist, setSearchHist] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState(
    ALL.find(e => e.id !== id)?.id || 'EMP002'
  );

  if (!emp) return <Navigate to="/employees" replace />;

  const initials = emp.name.split(' ').map(w => w[0]).join('').slice(0,2);

  const STATUS_META = {
    'On Leave':    { rgb:'225,29,72',  light:'#BE123C', dark:'#fda4af', label:'On Leave'    },
    'Active':      { rgb:'5,150,105',  light:'#047857', dark:'#6ee7b7', label:'Active'      },
    'Low Balance': { rgb:'217,119,6',  light:'#B45309', dark:'#fcd34d', label:'Low Balance' },
  };
  const sm = STATUS_META[emp.status] || STATUS_META['Active'];

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const tv = emp.trend;
    const nz = tv.filter(v => v > 0);
    const avg = nz.length ? nz.reduce((a,b)=>a+b,0)/nz.length : 0;
    const avgPlugin = {
      id: 'avgLine',
      afterDraw(c) {
        if (!avg) return;
        const { ctx, chartArea: { left, right }, scales: { y } } = c;
        const yp = y.getPixelForValue(avg);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(left, yp); ctx.lineTo(right, yp);
        ctx.strokeStyle = 'rgba(37,99,235,.55)'; ctx.lineWidth = 1.5;
        ctx.setLineDash([5,4]); ctx.stroke();
        ctx.fillStyle = 'rgba(37,99,235,.80)'; ctx.font = '600 10px Inter,sans-serif';
        ctx.fillText('avg ' + avg.toFixed(1), right - 46, yp - 5);
        ctx.restore();
      }
    };
    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          data: tv,
          backgroundColor: tv.map(v =>
            v === 0           ? 'rgba(100,116,139,.20)'
            : v >= avg * 1.4  ? 'rgba(225,29,72,.72)'
            : v >= avg        ? 'rgba(217,119,6,.68)'
                              : 'rgba(37,99,235,.70)'
          ),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => `${c.raw} days` } }
        },
        scales: {
          x: { grid:{ display:false }, ticks:{ color:'rgba(160,180,230,.50)', font:{ size:10 } } },
          y: { grid:{ color:'rgba(255,255,255,.06)' }, ticks:{ color:'rgba(160,180,230,.50)', font:{ size:10 }, stepSize:1 }, beginAtZero:true }
        }
      },
      plugins: [avgPlugin]
    });
    return () => chartInstance.current?.destroy();
  }, [emp]);

  const filteredHistory = emp.history.filter(r =>
    !searchHist || r.type.toLowerCase().includes(searchHist.toLowerCase())
  );

  return (
    <main className="main">
      <style>{`
        .hero{border-radius:22px;padding:28px 32px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;position:relative;overflow:hidden}
        .hero::before{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.13) 0%,transparent 55%);pointer-events:none}
        .hero::after{content:'';position:absolute;top:-60px;right:-60px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.06);pointer-events:none}
        .hero-av{width:70px;height:70px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;color:#fff;flex-shrink:0;background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.38);box-shadow:0 8px 24px rgba(0,0,0,.22),0 0 0 4px rgba(255,255,255,.10)}
        .hero-name{font-size:22px;font-weight:900;color:#fff;letter-spacing:-.03em}
        .hero-meta{font-size:12px;color:rgba(255,255,255,.62);margin-top:4px;font-weight:500}
        .hero-badges{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
        .hero-btn{display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:14px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;border:1.5px solid rgba(255,255,255,.35);background:rgba(255,255,255,.18);color:#fff;transition:all .18s;backdrop-filter:blur(8px)}
        .hero-btn:hover{background:rgba(255,255,255,.28)}

        .mini-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
        .ms-card{border-radius:16px;padding:18px 20px;transition:transform .20s cubic-bezier(.34,1.2,.64,1)}
        .ms-card:hover{transform:translateY(-3px)}

        .two-col{display:grid;grid-template-columns:1fr 1.4fr;gap:16px;margin-bottom:16px}
        .detail-card{border-radius:18px;padding:22px}

        .bal-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
        .bal-bg{height:9px;border-radius:5px;overflow:hidden;margin-bottom:14px}
        .bal-fill{height:100%;border-radius:5px}

        .search-field{position:relative;display:flex;align-items:center}
        .search-ico-abs{position:absolute;left:11px;pointer-events:none;opacity:.40}

        .cmp-select{width:100%;padding:10px 14px;border-radius:12px;font-size:13px;font-family:inherit;outline:none;margin:14px 0}
        .cmp-btn{padding:11px 28px;border-radius:13px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;border:none;background:linear-gradient(135deg,#2563EB,#1E40AF);color:#fff;box-shadow:0 4px 14px rgba(37,99,235,.35);transition:box-shadow .18s,transform .18s}
        .cmp-btn:hover{box-shadow:0 6px 20px rgba(37,99,235,.45);transform:translateY(-1px)}

        .tbl-wrap{overflow-x:auto}
        .rpt-overlay{display:none;position:fixed;inset:0;z-index:600;background:rgba(1,4,9,.80);backdrop-filter:blur(6px);align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto}
        .rpt-overlay.open{display:flex}
        #rpt-box{background:#fff;color:#111;border-radius:20px;width:720px;max-width:100%;box-shadow:0 32px 80px rgba(0,0,0,.70);overflow:hidden;font-family:'Inter',sans-serif}
        .rpt-toolbar{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:14px 20px;display:flex;align-items:center;justify-content:space-between}
        .rpt-toolbar-title{font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.06em}
        .rpt-close-btn{padding:7px 14px;border-radius:8px;background:#f1f5f9;border:1px solid #e2e8f0;font-size:12px;font-weight:700;color:#475569;cursor:pointer;font-family:inherit}
        .rpt-body{padding:36px 40px}
        @media(max-width:780px){.two-col{grid-template-columns:1fr}.mini-stats{grid-template-columns:repeat(2,1fr)}}
      `}</style>

      <BackButton to="/employees" label="Back to Employees" />

      {/* Hero */}
      <div className="hero g" style={{background:emp.color}}>
        <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
          <div className="hero-av">{initials}</div>
          <div>
            <div className="hero-name">{emp.name}</div>
            <div className="hero-meta">{emp.id} · {emp.dept} · Joined {emp.joined}</div>
            <div className="hero-badges">
              {/* Status badge */}
              <span style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'3px 11px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:'rgba(0,0,0,.22)',border:'1px solid rgba(255,255,255,.25)',color:'#fff'}}>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'rgba(255,255,255,.80)',display:'inline-block'}}/>
                {emp.status}
              </span>
              {/* Days this year badge */}
              <span style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'3px 11px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:'rgba(255,255,255,.18)',border:'1px solid rgba(255,255,255,.28)',color:'rgba(255,255,255,.92)'}}>
                {emp.stats.total} days this year
              </span>
            </div>
          </div>
        </div>
        <button className="hero-btn" onClick={() => setReportOpen(true)}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v8M5 7l3 3 3-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 12h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Download Report
        </button>
      </div>

      {/* Mini stats */}
      <div className="mini-stats">
        {MINI_STATS.map(s => {
          const val = emp.stats[s.key];
          return (
            <div key={s.key} className="ms-card g">
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px'}}>
                <div style={{width:'40px',height:'40px',borderRadius:'12px',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:`0 4px 12px ${s.bg.includes('2563')? 'rgba(37,99,235,.30)': s.bg.includes('059')? 'rgba(5,150,105,.28)': s.bg.includes('E11')? 'rgba(225,29,72,.28)':'rgba(217,119,6,.28)'}`}}>
                  {s.icon}
                </div>
                <div style={{fontSize:'10px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:isLight?`rgba(${s.bg.includes('2563')? '29,78,216': s.bg.includes('059')? '4,120,87': s.bg.includes('E11')? '159,18,57':'146,64,14'},.65)`:s.color.replace('#','rgba(').replace(/([0-9a-f]{2})/gi,(m,_,o)=>o<6?parseInt(m,16)+',':'')+'0.70)'}}>
                  {s.label}
                </div>
              </div>
              <div style={{fontSize:'32px',fontWeight:800,letterSpacing:'-.03em',lineHeight:1,color:isLight?s.lightColor:s.color}}>{val}</div>
              <div style={{fontSize:'11px',marginTop:'6px',color:isLight?'rgba(71,85,105,.45)':'rgba(160,180,230,.42)'}}>{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Two-col: balance + chart */}
      <div className="two-col">
        {/* Leave balance */}
        <div className="detail-card g">
          <div className="sec-lbl" style={{marginBottom:'18px'}}>Leave Balance</div>
          {emp.balance.map(b => {
            const p = Math.round(b.used / b.max * 100);
            const tm = TYPE_META[b.name] || { color: b.color, rgb:'100,116,139' };
            return (
              <div key={b.name}>
                <div className="bal-row">
                  <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                    <span style={{width:'8px',height:'8px',borderRadius:'50%',background:tm.color,flexShrink:0,boxShadow:`0 0 0 2px rgba(${tm.rgb},.20)`}}/>
                    <span style={{fontSize:'13px',fontWeight:600,color:isLight?'rgba(20,30,70,.80)':'rgba(200,215,255,.82)'}}>{b.name}</span>
                  </div>
                  <span style={{fontSize:'12px',color:isLight?'rgba(60,80,120,.50)':'rgba(160,180,230,.52)',fontVariantNumeric:'tabular-nums'}}>
                    {b.used}/{b.max} &nbsp;
                    <span style={{fontWeight:700,color:isLight?`rgb(${tm.rgb})`:lighten(tm.rgb)}}>{p}%</span>
                  </span>
                </div>
                <div className="bal-bg" style={{background:isLight?'rgba(0,0,0,.07)':'rgba(255,255,255,.08)'}}>
                  <div className="bal-fill" style={{width:`${p}%`,background:`linear-gradient(90deg,${tm.color},${tm.color}cc)`}}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Monthly trend chart */}
        <div className="detail-card g">
          <div className="sec-lbl" style={{marginBottom:'14px'}}>Monthly Leave Trend</div>
          <div style={{position:'relative',height:'220px'}}>
            <canvas ref={chartRef}/>
          </div>
        </div>
      </div>

      {/* Leave history */}
      <div className="detail-card g" style={{marginBottom:'16px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'9px'}}>
            <div className="sec-lbl" style={{marginBottom:0}}>Leave History</div>
            <div style={{fontSize:'11px',fontWeight:700,padding:'2px 9px',borderRadius:'20px',
              background:isLight?'rgba(37,99,235,.08)':'rgba(37,99,235,.14)',
              border:`1px solid rgba(37,99,235,${isLight?'.14':'.24'})`,
              color:isLight?'#1D4ED8':'#93c5fd'}}>
              {filteredHistory.length}
            </div>
          </div>
          <div className="search-field">
            <svg className="search-ico-abs" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input className="search-inp" placeholder="Search type…" style={{maxWidth:'200px',paddingLeft:'28px'}} value={searchHist} onChange={e => setSearchHist(e.target.value)}/>
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filteredHistory.map((r) => {
                const tm = TYPE_META[r.type] || { color: r.color, rgb:'100,116,139' };
                return (
                  <tr key={r.from + r.type}>
                    <td>
                      <span style={{display:'inline-flex',alignItems:'center',gap:'7px'}}>
                        <span style={{width:'7px',height:'7px',borderRadius:'50%',background:tm.color,flexShrink:0}}/>
                        {r.type}
                      </span>
                    </td>
                    <td style={{fontVariantNumeric:'tabular-nums'}}>{r.from}</td>
                    <td style={{fontVariantNumeric:'tabular-nums'}}>{r.to}</td>
                    <td style={{fontWeight:700}}>{r.days}</td>
                    <td>
                      {r.status === 'Active'
                        ? <span style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:isLight?'rgba(5,150,105,.10)':'rgba(5,150,105,.16)',border:`1px solid rgba(5,150,105,${isLight?'.20':'.30'})`,color:isLight?'#047857':'#6ee7b7'}}>
                            <span style={{width:'5px',height:'5px',borderRadius:'50%',background:'#10b981',display:'inline-block'}}/>
                            Active
                          </span>
                        : <span style={{display:'inline-flex',alignItems:'center',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:isLight?'rgba(100,116,139,.08)':'rgba(100,116,139,.12)',border:`1px solid rgba(100,116,139,${isLight?'.14':'.20'})`,color:isLight?'rgba(60,80,120,.55)':'rgba(150,168,210,.52)'}}>
                            Completed
                          </span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compare */}
      <div className="detail-card g">
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'linear-gradient(135deg,#2563EB,#1E40AF)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 3px 10px rgba(37,99,235,.28)'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 4L3 8l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".55"/>
            </svg>
          </div>
          <div className="sec-lbl" style={{marginBottom:0}}>Compare with Another Employee</div>
        </div>
        <p style={{fontSize:'13px',color:isLight?'rgba(60,80,120,.55)':'rgba(160,180,230,.52)',marginBottom:0,marginLeft:'42px'}}>
          Select a colleague to view a side-by-side leave comparison.
        </p>
        <select className="cmp-select" value={compareTarget} onChange={e => setCompareTarget(e.target.value)} style={{
          background: isLight?'rgba(255,255,255,.65)':'rgba(255,255,255,.07)',
          border: isLight?'1px solid rgba(200,210,240,.65)':'1px solid rgba(255,255,255,.14)',
          color: isLight?'rgba(15,23,42,.85)':'rgba(220,230,255,.90)',
        }}>
          {ALL.filter(e => e.id !== emp.id).map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
          ))}
        </select>
        <button className="cmp-btn" onClick={() => navigate(`/compare?emp1=${emp.id}&emp2=${compareTarget}`)}>
          Compare Side by Side →
        </button>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="rpt-overlay open" onClick={e => { if (e.target === e.currentTarget) setReportOpen(false); }}>
          <div id="rpt-box">
            <div className="rpt-toolbar">
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div style={{width:'28px',height:'28px',borderRadius:'8px',background:'linear-gradient(135deg,#2563EB,#1E40AF)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 1h5.5L11 3.5V13H3V1z" stroke="white" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
                    <path d="M8.5 1v3H11" stroke="white" strokeWidth="1.3" strokeLinejoin="round" opacity=".7"/>
                    <line x1="5" y1="6" x2="9" y2="6" stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
                    <line x1="5" y1="8.5" x2="8" y2="8.5" stroke="white" strokeWidth="1.1" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="rpt-toolbar-title">Employee Report</span>
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                <button className="rpt-close-btn" onClick={() => setReportOpen(false)}>✕ Close</button>
                <button style={{padding:'7px 16px',borderRadius:'8px',background:'linear-gradient(135deg,#2563EB,#1E40AF)',border:'none',fontSize:'12px',fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:'inherit',boxShadow:'0 2px 8px rgba(37,99,235,.30)'}} onClick={() => window.print()}>
                  Download PDF
                </button>
              </div>
            </div>
            <div className="rpt-body">
              {/* Report header */}
              <div style={{display:'flex',alignItems:'center',gap:'20px',marginBottom:'28px',paddingBottom:'24px',borderBottom:'2px solid #f1f5f9'}}>
                <div style={{width:'68px',height:'68px',borderRadius:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',fontWeight:800,color:'#fff',flexShrink:0,background:emp.color,boxShadow:'0 4px 16px rgba(0,0,0,.15)'}}>
                  {initials}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'22px',fontWeight:800,color:'#0f172a',letterSpacing:'-.02em'}}>{emp.name}</div>
                  <div style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}>{emp.id} · {emp.dept} · Joined {emp.joined}</div>
                  <span style={{display:'inline-flex',alignItems:'center',gap:'5px',marginTop:'8px',padding:'3px 11px',borderRadius:'20px',fontSize:'11px',fontWeight:700,
                    background: emp.status==='On Leave'?'#fee2e2': emp.status==='Low Balance'?'#fef3c7':'#dcfce7',
                    color: emp.status==='On Leave'?'#BE123C': emp.status==='Low Balance'?'#B45309':'#047857',
                  }}>
                    {emp.status}
                  </span>
                </div>
              </div>
              {/* Report stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'24px'}}>
                {[
                  ['Days This Year', emp.stats.total,     '#2563EB'],
                  ['Remaining',      emp.stats.remaining, '#059669'],
                  ['Longest Streak', emp.stats.streak,    '#E11D48'],
                  ['Avg/Month',      emp.stats.avg,       '#D97706'],
                ].map(([l,v,c]) => (
                  <div key={l} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'14px',textAlign:'center'}}>
                    <div style={{fontSize:'24px',fontWeight:800,color:c,letterSpacing:'-.02em'}}>{v}</div>
                    <div style={{fontSize:'10px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.06em',marginTop:'4px'}}>{l}</div>
                  </div>
                ))}
              </div>
              {/* Report balance */}
              <div style={{marginBottom:'22px'}}>
                <div style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'12px',paddingBottom:'6px',borderBottom:'1px solid #f1f5f9'}}>Leave Balance</div>
                {emp.balance.map(b => {
                  const p = Math.round(b.used/b.max*100);
                  const tm = TYPE_META[b.name] || { color: b.color };
                  return (
                    <div key={b.name} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                      <div style={{fontSize:'13px',fontWeight:600,color:'#334155',width:'120px',flexShrink:0}}>{b.name}</div>
                      <div style={{flex:1,height:'8px',background:'#f1f5f9',borderRadius:'4px',overflow:'hidden'}}><div style={{height:'100%',borderRadius:'4px',width:`${p}%`,background:tm.color}}/></div>
                      <div style={{fontSize:'12px',color:'#94a3b8',width:'70px',textAlign:'right',flexShrink:0}}>{b.used}/{b.max}</div>
                    </div>
                  );
                })}
              </div>
              {/* Report history */}
              <div>
                <div style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'12px',paddingBottom:'6px',borderBottom:'1px solid #f1f5f9'}}>Leave History</div>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                  <thead>
                    <tr>{['Type','From','To','Days','Status'].map(h => <th key={h} style={{background:'#f8fafc',padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.06em',borderBottom:'1px solid #e2e8f0'}}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {emp.history.map((r) => {
                      const tm = TYPE_META[r.type] || { color: r.color };
                      return (
                        <tr key={r.from + r.type}>
                          <td style={{padding:'9px 12px',borderBottom:'1px solid #f8fafc',color:'#334155'}}>
                            <span style={{display:'inline-flex',alignItems:'center',gap:'6px'}}>
                              <span style={{width:'6px',height:'6px',borderRadius:'50%',background:tm.color,display:'inline-block'}}/>
                              {r.type}
                            </span>
                          </td>
                          <td style={{padding:'9px 12px',borderBottom:'1px solid #f8fafc',color:'#334155'}}>{r.from}</td>
                          <td style={{padding:'9px 12px',borderBottom:'1px solid #f8fafc',color:'#334155'}}>{r.to}</td>
                          <td style={{padding:'9px 12px',borderBottom:'1px solid #f8fafc',color:'#334155',textAlign:'center',fontWeight:700}}>{r.days}</td>
                          <td style={{padding:'9px 12px',borderBottom:'1px solid #f8fafc'}}>
                            <span style={{padding:'2px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:700,
                              background: r.status==='Active'?'#dcfce7':'#f1f5f9',
                              color: r.status==='Active'?'#047857':'#64748b'}}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function lighten(rgb) {
  const m = {'37,99,235':'#93c5fd','225,29,72':'#fda4af','217,119,6':'#fcd34d','5,150,105':'#6ee7b7','124,58,237':'#c4b5fd'};
  return m[rgb] || '#c9d1d9';
}
