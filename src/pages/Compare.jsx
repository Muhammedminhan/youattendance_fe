import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { EMPS, ALL } from '../data/employees';
import { Chart } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

/* Slot A = cobalt, Slot B = rose — consistent across all elements */
const SLOT = {
  A: { rgb:'37,99,235',  color:'#2563EB', light:'#1D4ED8', dark:'#93c5fd',  barColor:'rgba(37,99,235,.72)'  },
  B: { rgb:'225,29,72',  color:'#E11D48', light:'#BE123C', dark:'#fda4af',  barColor:'rgba(225,29,72,.68)'  },
};

const TYPE_META = {
  'Annual Leave': { color:'#2563EB', rgb:'37,99,235'  },
  'Sick Leave':   { color:'#E11D48', rgb:'225,29,72'  },
  'Emergency':    { color:'#D97706', rgb:'217,119,6'  },
  'WFH':          { color:'#059669', rgb:'5,150,105'  },
  'Unpaid':       { color:'#7C3AED', rgb:'124,58,237' },
};

function initials(name) { return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(); }

function StatusPill({ status, isLight }) {
  const m = {
    'On Leave':    { rgb:'225,29,72',  lc:'#BE123C', dc:'#fda4af' },
    'Low Balance': { rgb:'217,119,6',  lc:'#B45309', dc:'#fcd34d' },
    'Active':      { rgb:'5,150,105',  lc:'#047857', dc:'#6ee7b7' },
  }[status] || { rgb:'100,116,139', lc:'#475569', dc:'rgba(150,168,210,.60)' };
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700,
      background:`rgba(${m.rgb},${isLight?'.08':'.14'})`,border:`1px solid rgba(${m.rgb},${isLight?'.16':'.26'})`,
      color:isLight?m.lc:m.dc}}>
      <span style={{width:'5px',height:'5px',borderRadius:'50%',background:`rgb(${m.rgb})`,display:'inline-block'}}/>
      {status}
    </span>
  );
}

function donutData(emp) {
  const map = {};
  emp.balance.forEach(b => {
    if (b.used > 0) {
      const tm = TYPE_META[b.name] || { color: b.color };
      map[b.name] = { val: b.used, color: tm.color };
    }
  });
  return { labels: Object.keys(map), vals: Object.values(map).map(x=>x.val), colors: Object.values(map).map(x=>x.color) };
}

function CmpRow({ metricLabel, va, vb, lowerBetter, unit = '', isLight }) {
  const aWins = lowerBetter ? va <= vb : va >= vb;
  const bWins = lowerBetter ? vb <= va : vb >= va;
  const tie   = va === vb;
  const aHL   = aWins && !tie;
  const bHL   = bWins && !tie;
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 180px 1fr',alignItems:'center',borderBottom:`1px solid ${isLight?'rgba(0,0,0,.05)':'rgba(255,255,255,.06)'}`}}>
      {/* A value */}
      <div style={{padding:'13px 20px',display:'flex',alignItems:'center',justifyContent:'flex-end',gap:'6px',
        background: aHL ? (isLight?`rgba(${SLOT.A.rgb},.06)`:`rgba(${SLOT.A.rgb},.09)`) : 'transparent',
        borderRight: aHL ? `2px solid rgba(${SLOT.A.rgb},.45)` : '2px solid transparent',
        fontSize:'16px',fontWeight:800,
        color: aHL ? (isLight?SLOT.A.light:SLOT.A.dark) : (isLight?'rgba(30,41,59,.72)':'rgba(200,215,255,.75)'),
      }}>
        {va}
        {unit && <span style={{fontSize:'11px',fontWeight:600,opacity:.65}}>{unit}</span>}
        {aHL && <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{opacity:.8}}>
          <polyline points="2,7 5.5,10.5 12,3.5" stroke={isLight?SLOT.A.light:SLOT.A.dark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </div>
      {/* Metric label */}
      <div style={{fontSize:'10px',fontWeight:700,color:isLight?'rgba(71,85,105,.50)':'rgba(160,180,220,.42)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'center',padding:'12px 6px',background:isLight?'rgba(0,0,0,.025)':'rgba(0,0,0,.12)'}}>
        {metricLabel}
      </div>
      {/* B value */}
      <div style={{padding:'13px 20px',display:'flex',alignItems:'center',justifyContent:'flex-start',gap:'6px',
        background: bHL ? (isLight?`rgba(${SLOT.B.rgb},.06)`:`rgba(${SLOT.B.rgb},.09)`) : 'transparent',
        borderLeft: bHL ? `2px solid rgba(${SLOT.B.rgb},.45)` : '2px solid transparent',
        fontSize:'16px',fontWeight:800,
        color: bHL ? (isLight?SLOT.B.light:SLOT.B.dark) : (isLight?'rgba(30,41,59,.72)':'rgba(200,215,255,.75)'),
      }}>
        {vb}
        {unit && <span style={{fontSize:'11px',fontWeight:600,opacity:.65}}>{unit}</span>}
        {bHL && <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{opacity:.8}}>
          <polyline points="2,7 5.5,10.5 12,3.5" stroke={isLight?SLOT.B.light:SLOT.B.dark} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </div>
    </div>
  );
}

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [emp1Id, setEmp1Id] = useState(searchParams.get('emp1') || 'EMP001');
  const [emp2Id, setEmp2Id] = useState(searchParams.get('emp2') || 'EMP004');
  const [modalOpen, setModalOpen]       = useState(false);
  const [changingSlot, setChangingSlot] = useState(null);
  const { isLight } = useTheme();

  const barRef    = useRef(null);
  const donut1Ref = useRef(null);
  const donut2Ref = useRef(null);
  const barChart    = useRef(null);
  const donut1Chart = useRef(null);
  const donut2Chart = useRef(null);

  const a = EMPS[emp1Id] || EMPS.EMP001;
  const b = EMPS[emp2Id] || EMPS.EMP004;

  useEffect(() => {
    setSearchParams({ emp1: emp1Id, emp2: emp2Id }, { replace: true });
  }, [emp1Id, emp2Id, setSearchParams]);

  useEffect(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    if (barRef.current) {
      barChart.current?.destroy();
      barChart.current = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            { label: a.name.split(' ')[0], data: a.trend, backgroundColor: SLOT.A.barColor, borderRadius: 4, borderSkipped: false },
            { label: b.name.split(' ')[0], data: b.trend, backgroundColor: SLOT.B.barColor, borderRadius: 4, borderSkipped: false },
          ]
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend:{ display:false }, tooltip:{ callbacks:{ label: ctx => ctx.dataset.label + ': ' + ctx.raw + ' days' } } },
          scales: {
            x: { grid:{ display:false }, ticks:{ color:'rgba(160,180,230,.50)', font:{ size:10 } } },
            y: { grid:{ color:'rgba(255,255,255,.06)' }, ticks:{ color:'rgba(160,180,230,.50)', font:{ size:10 }, stepSize:1 }, beginAtZero:true }
          }
        }
      });
    }

    const donutOpts = {
      maintainAspectRatio: false,
      plugins: {
        legend: { position:'bottom', labels:{ color:'rgba(160,180,230,.60)', font:{ size:10 }, padding:8, boxWidth:10 } },
        tooltip: { callbacks:{ label: ctx => ctx.label + ': ' + ctx.raw + ' days' } }
      },
      cutout: '62%'
    };

    if (donut1Ref.current) {
      donut1Chart.current?.destroy();
      const d1 = donutData(a);
      donut1Chart.current = new Chart(donut1Ref.current, {
        type: 'doughnut',
        data: { labels: d1.labels, datasets: [{ data: d1.vals, backgroundColor: d1.colors.map(c => c + 'cc'), borderWidth:0 }] },
        options: donutOpts
      });
    }
    if (donut2Ref.current) {
      donut2Chart.current?.destroy();
      const d2 = donutData(b);
      donut2Chart.current = new Chart(donut2Ref.current, {
        type: 'doughnut',
        data: { labels: d2.labels, datasets: [{ data: d2.vals, backgroundColor: d2.colors.map(c => c + 'cc'), borderWidth:0 }] },
        options: donutOpts
      });
    }
    return () => { barChart.current?.destroy(); donut1Chart.current?.destroy(); donut2Chart.current?.destroy(); };
  }, [emp1Id, emp2Id]);

  const aAnnual = a.balance.find(x => x.name === 'Annual Leave');
  const bAnnual = b.balance.find(x => x.name === 'Annual Leave');
  const aSick   = a.balance.find(x => x.name === 'Sick Leave');
  const bSick   = b.balance.find(x => x.name === 'Sick Leave');
  const aTypes  = a.balance.filter(x => x.used > 0).length;
  const bTypes  = b.balance.filter(x => x.used > 0).length;

  const rowProps = { isLight };

  return (
    <main className="main">
      <style>{`
        .emp-selector-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
        .emp-sel-card{border-radius:18px;padding:20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
        .sel-avatar{width:54px;height:54px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;flex-shrink:0}
        .change-btn{margin-left:auto;padding:6px 14px;border-radius:10px;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .15s}
        .charts-3col{display:grid;grid-template-columns:2fr 1fr 1fr;gap:16px;margin-bottom:16px}
        .chart-card{border-radius:18px;padding:20px}
        .donut-wrap{position:relative;height:180px}
        .hist-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .hist-card{border-radius:18px;padding:20px}
        .hist-item{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06)}
        .hist-item:last-child{border-bottom:none}
        html.light .hist-item{border-bottom-color:rgba(0,0,0,.05)}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:500;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
        .modal-opt{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;cursor:pointer;transition:background .14s}
        @media(max-width:900px){.charts-3col{grid-template-columns:1fr}.emp-selector-row{grid-template-columns:1fr}.hist-2col{grid-template-columns:1fr}}
        @media(max-width:600px){.cmp-metric{font-size:9px;padding:10px 4px}}
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'24px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={{width:'44px',height:'44px',borderRadius:'14px',background:'linear-gradient(135deg,#2563EB,#1E40AF)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(37,99,235,.35)',flexShrink:0}}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="4" width="5" height="8" rx="1.5" stroke="white" strokeWidth="1.4" fill="none" opacity=".9"/>
              <rect x="10" y="4" width="5" height="8" rx="1.5" stroke="white" strokeWidth="1.4" fill="none" opacity=".9"/>
              <line x1="6" y1="8" x2="10" y2="8" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity=".7"/>
              <polyline points="8.5,6 10,8 8.5,10" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
            </svg>
          </div>
          <div>
            <div className="page-title">Compare Employees</div>
            <div className="page-sub">Side-by-side leave analysis</div>
          </div>
        </div>
        <Link to="/employees" className="back-btn">← Back</Link>
      </div>

      {/* Employee selector cards */}
      <div className="emp-selector-row">
        {[{ emp: a, slot: 'A', setId: setEmp1Id }, { emp: b, slot: 'B', setId: setEmp2Id }].map(({ emp, slot }) => {
          const s = SLOT[slot];
          return (
            <div key={slot} className="emp-sel-card g" style={{borderTop:`3px solid rgba(${s.rgb},.55)`}}>
              <div className="sel-avatar" style={{
                background: emp.color,
                boxShadow: `0 0 0 3px rgba(${s.rgb},.35), 0 4px 14px rgba(0,0,0,.20)`,
              }}>
                {initials(emp.name)}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2px'}}>
                  <div style={{fontSize:'14px',fontWeight:700,color:isLight?'rgba(15,23,42,.88)':'rgba(220,230,255,.90)'}}>{emp.name}</div>
                  <div style={{fontSize:'10px',fontWeight:800,padding:'1px 7px',borderRadius:'20px',background:`rgba(${s.rgb},.12)`,border:`1px solid rgba(${s.rgb},.22)`,color:isLight?s.light:s.dark,letterSpacing:'.04em'}}>
                    {slot}
                  </div>
                </div>
                <div style={{fontSize:'11px',color:isLight?'rgba(71,85,105,.50)':'rgba(160,180,230,.42)',marginBottom:'3px'}}>{emp.id} · {emp.dept}</div>
                <StatusPill status={emp.status} isLight={isLight} />
              </div>
              <button className="change-btn" onClick={() => { setChangingSlot(slot); setModalOpen(true); }} style={{
                background: isLight?'rgba(255,255,255,.72)':'rgba(255,255,255,.07)',
                border: isLight?`1px solid rgba(${s.rgb},.20)`:`1px solid rgba(${s.rgb},.22)`,
                color: isLight?s.light:s.dark,
              }}>
                Change
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="g" style={{borderRadius:'18px',overflow:'hidden',marginBottom:'16px',padding:0}}>
        {/* Header row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 180px 1fr',background:isLight?'rgba(0,0,0,.03)':'rgba(0,0,0,.18)',borderBottom:`1px solid ${isLight?'rgba(0,0,0,.06)':'rgba(255,255,255,.08)'}`}}>
          <div style={{padding:'12px 20px',textAlign:'center',fontSize:'12px',fontWeight:800,letterSpacing:'-.01em',color:isLight?SLOT.A.light:SLOT.A.dark}}>
            {a.name}
          </div>
          <div style={{padding:'12px 8px',textAlign:'center',fontSize:'10px',fontWeight:700,color:isLight?'rgba(71,85,105,.50)':'rgba(160,180,220,.42)',textTransform:'uppercase',letterSpacing:'.08em'}}>
            Metric
          </div>
          <div style={{padding:'12px 20px',textAlign:'center',fontSize:'12px',fontWeight:800,letterSpacing:'-.01em',color:isLight?SLOT.B.light:SLOT.B.dark}}>
            {b.name}
          </div>
        </div>
        <CmpRow metricLabel="Total Days This Year" va={a.stats.total}    vb={b.stats.total}    lowerBetter unit="days" {...rowProps}/>
        <CmpRow metricLabel="Annual Leave Used"    va={aAnnual?.used||0} vb={bAnnual?.used||0} lowerBetter unit="days" {...rowProps}/>
        <CmpRow metricLabel="Sick Leave Used"      va={aSick?.used||0}   vb={bSick?.used||0}   lowerBetter unit="days" {...rowProps}/>
        <CmpRow metricLabel="Remaining Balance"    va={a.stats.remaining} vb={b.stats.remaining} lowerBetter={false} unit="days" {...rowProps}/>
        <CmpRow metricLabel="Longest Streak"       va={a.stats.streak}   vb={b.stats.streak}   lowerBetter unit="days" {...rowProps}/>
        <CmpRow metricLabel="Avg Per Month"        va={a.stats.avg}      vb={b.stats.avg}       lowerBetter unit="/ mo" {...rowProps}/>
        <CmpRow metricLabel="Leave Types Used"     va={aTypes}           vb={bTypes}            lowerBetter {...rowProps}/>
        {/* Status row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 180px 1fr',alignItems:'center'}}>
          <div style={{padding:'13px 20px',display:'flex',justifyContent:'flex-end'}}><StatusPill status={a.status} isLight={isLight}/></div>
          <div style={{fontSize:'10px',fontWeight:700,color:isLight?'rgba(71,85,105,.50)':'rgba(160,180,220,.42)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'center',padding:'12px 6px',background:isLight?'rgba(0,0,0,.025)':'rgba(0,0,0,.12)'}}>
            Current Status
          </div>
          <div style={{padding:'13px 20px',display:'flex',justifyContent:'flex-start'}}><StatusPill status={b.status} isLight={isLight}/></div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-3col">
        <div className="chart-card g">
          <div className="sec-lbl" style={{marginBottom:'14px'}}>Monthly Leave Comparison</div>
          <div style={{height:'240px'}}><canvas ref={barRef}/></div>
          <div style={{display:'flex',gap:'18px',justifyContent:'center',marginTop:'12px'}}>
            {[{s:SLOT.A,name:a.name},{s:SLOT.B,name:b.name}].map(({s,name})=>(
              <span key={name} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',fontWeight:600,color:isLight?'rgba(60,80,120,.55)':'rgba(160,180,220,.55)'}}>
                <span style={{width:'11px',height:'11px',borderRadius:'3px',background:s.barColor,display:'inline-block'}}/>
                {name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
        <div className="chart-card g">
          <div className="sec-lbl" style={{marginBottom:'10px'}}>{a.name.split(' ')[0]} — Leave Types</div>
          <div className="donut-wrap"><canvas ref={donut1Ref}/></div>
        </div>
        <div className="chart-card g">
          <div className="sec-lbl" style={{marginBottom:'10px'}}>{b.name.split(' ')[0]} — Leave Types</div>
          <div className="donut-wrap"><canvas ref={donut2Ref}/></div>
        </div>
      </div>

      {/* History */}
      <div className="hist-2col">
        {[{emp:a,slot:'A'},{emp:b,slot:'B'}].map(({emp,slot})=>{
          const s = SLOT[slot];
          const rows = emp.history.slice(0,5);
          return (
            <div key={slot} className="hist-card g" style={{borderTop:`2px solid rgba(${s.rgb},.40)`}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'14px'}}>
                <div className="sec-lbl" style={{marginBottom:0}}>{emp.name.split(' ')[0]}'s Last Records</div>
                <div style={{fontSize:'10px',fontWeight:800,padding:'1px 7px',borderRadius:'20px',background:`rgba(${s.rgb},.12)`,border:`1px solid rgba(${s.rgb},.22)`,color:isLight?s.light:s.dark}}>
                  {slot}
                </div>
              </div>
              {rows.length === 0
                ? <div style={{fontSize:'12px',color:'rgba(160,180,220,.40)',padding:'12px 0'}}>No records</div>
                : rows.map((h) => {
                  const tm = TYPE_META[h.type] || { color: h.color, rgb:'100,116,139' };
                  return (
                    <div key={h.from + h.type} className="hist-item">
                      <span style={{width:'8px',height:'8px',borderRadius:'50%',background:tm.color,flexShrink:0,boxShadow:`0 0 0 2px rgba(${tm.rgb},.20)`}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:'12px',fontWeight:600,color:isLight?'rgba(20,30,70,.80)':'rgba(200,215,255,.78)'}}>{h.type}</div>
                        <div style={{fontSize:'10px',color:isLight?'rgba(60,80,120,.45)':'rgba(160,180,220,.42)',marginTop:'1px'}}>{h.from}{h.to !== h.from ? ' – ' + h.to : ''}</div>
                      </div>
                      <div style={{fontSize:'12px',fontWeight:700,color:isLight?'rgba(60,80,120,.55)':'rgba(160,180,220,.55)',marginRight:'8px'}}>{h.days}d</div>
                      {h.status === 'Active'
                        ? <span style={{display:'inline-flex',alignItems:'center',gap:'4px',padding:'2px 9px',borderRadius:'20px',fontSize:'10px',fontWeight:700,background:isLight?'rgba(5,150,105,.10)':'rgba(5,150,105,.16)',border:`1px solid rgba(5,150,105,${isLight?'.18':'.28'})`,color:isLight?'#047857':'#6ee7b7'}}>
                            <span style={{width:'4px',height:'4px',borderRadius:'50%',background:'#10b981',display:'inline-block'}}/>Active
                          </span>
                        : <span style={{padding:'2px 9px',borderRadius:'20px',fontSize:'10px',fontWeight:700,background:isLight?'rgba(100,116,139,.08)':'rgba(100,116,139,.12)',border:`1px solid rgba(100,116,139,${isLight?'.14':'.20'})`,color:isLight?'rgba(60,80,120,.50)':'rgba(150,168,210,.50)'}}>
                            Done
                          </span>
                      }
                    </div>
                  );
                })
              }
            </div>
          );
        })}
      </div>

      {/* Change employee modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div style={{width:'340px',borderRadius:'20px',padding:'24px',
            background:isLight?'rgba(248,250,255,.98)':'rgba(13,17,27,.96)',
            border:isLight?'1px solid rgba(200,210,240,.60)':'1px solid rgba(255,255,255,.12)',
            boxShadow:'0 24px 64px rgba(0,0,0,.50)'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'18px'}}>
              <div style={{width:'28px',height:'28px',borderRadius:'8px',background:`linear-gradient(135deg,${SLOT[changingSlot]?.color || '#2563EB'},${changingSlot==='A'?'#1E40AF':'#9F1239'})`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{color:'white',fontSize:'11px',fontWeight:800}}>{changingSlot}</span>
              </div>
              <div style={{fontSize:'14px',fontWeight:800,color:isLight?'rgba(15,23,42,.88)':'rgba(220,230,255,.92)'}}>
                Select Employee
              </div>
            </div>
            {Object.values(EMPS)
              .filter(e => e.id !== (changingSlot === 'A' ? emp2Id : emp1Id))
              .map(e => (
                <div key={e.id} className="modal-opt"
                  style={{'--hover-bg': isLight?'rgba(0,0,0,.04)':'rgba(255,255,255,.06)'}}
                  onMouseEnter={el => el.currentTarget.style.background = isLight?'rgba(37,99,235,.06)':'rgba(255,255,255,.06)'}
                  onMouseLeave={el => el.currentTarget.style.background = 'transparent'}
                  onClick={() => {
                    if (changingSlot === 'A') setEmp1Id(e.id);
                    else setEmp2Id(e.id);
                    setModalOpen(false);
                  }}>
                  <div style={{width:'34px',height:'34px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:800,color:'#fff',flexShrink:0,background:e.color,boxShadow:`0 3px 10px rgba(0,0,0,.20)`}}>
                    {initials(e.name)}
                  </div>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:700,color:isLight?'rgba(20,30,70,.85)':'rgba(200,215,255,.88)'}}>{e.name}</div>
                    <div style={{fontSize:'11px',color:isLight?'rgba(71,85,105,.50)':'rgba(160,180,220,.45)',marginTop:'1px'}}>{e.id} · {e.dept}</div>
                  </div>
                </div>
              ))}
            <button onClick={() => setModalOpen(false)} style={{marginTop:'12px',width:'100%',padding:'9px',borderRadius:'12px',fontSize:'13px',fontWeight:700,fontFamily:'inherit',cursor:'pointer',
              background:isLight?'rgba(0,0,0,.04)':'rgba(255,255,255,.06)',border:isLight?'1px solid rgba(0,0,0,.08)':'1px solid rgba(255,255,255,.10)',color:isLight?'rgba(71,85,105,.65)':'rgba(160,180,220,.60)'}}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
