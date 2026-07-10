import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { EMPS, ALL } from '../data/employees';
import { Chart } from 'chart.js';

// TODO: replace with api call

function initials(name) { return name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(); }

function statusBadge(s) {
  if (s === 'On Leave') return <span className="badge badge-red">On Leave</span>;
  if (s === 'Low Balance') return <span className="badge badge-amber">Low Balance</span>;
  return <span className="badge badge-green">Active</span>;
}

function histItems(emp) {
  const rows = emp.history.slice(0,5);
  if (!rows.length) return <div style={{fontSize:'12px',color:'rgba(180,200,240,.40)',padding:'12px 0'}}>No records</div>;
  return rows.map((h) => (
    <div key={h.from + h.type} className="hist-item">
      <div className="hist-dot" style={{background:h.color}}></div>
      <div style={{flex:1}}>
        <div className="hist-type">{h.type}</div>
        <div className="hist-dates">{h.from}{h.to !== h.from ? ' – ' + h.to : ''}</div>
      </div>
      <div className="hist-days">{h.days}d</div>
      {h.status === 'Active' ? <span className="badge badge-red">Active</span> : <span className="badge badge-gray">Done</span>}
    </div>
  ));
}

function donutData(emp) {
  const map = {};
  emp.balance.forEach(b => { if (b.used > 0) map[b.name] = { val: b.used, color: b.color }; });
  return { labels: Object.keys(map), vals: Object.values(map).map(x => x.val), colors: Object.values(map).map(x => x.color) };
}

function CmpRow({ metricLabel, va, vb, lowerBetter, unit = '' }) {
  const aWins = lowerBetter ? va <= vb : va >= vb;
  const bWins = lowerBetter ? vb <= va : vb >= va;
  const aClass = aWins && va !== vb ? ' winner' : '';
  const bClass = bWins && va !== vb ? ' winner' : '';
  return (
    <div className="cmp-row">
      <div className={`cmp-val left${aClass}`}>{va}{unit ? <span style={{fontSize:'11px',fontWeight:600,opacity:.7}}> {unit}{aWins && va !== vb ? ' ✓' : ''}</span> : null}</div>
      <div className="cmp-metric">{metricLabel}</div>
      <div className={`cmp-val right${bClass}`}>{vb}{unit ? <span style={{fontSize:'11px',fontWeight:600,opacity:.7}}> {unit}{bWins && va !== vb ? ' ✓' : ''}</span> : null}</div>
    </div>
  );
}

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [emp1Id, setEmp1Id] = useState(searchParams.get('emp1') || 'EMP001');
  const [emp2Id, setEmp2Id] = useState(searchParams.get('emp2') || 'EMP004');
  const [modalOpen, setModalOpen] = useState(false);
  const [changingSlot, setChangingSlot] = useState(null);

  const barRef = useRef(null);
  const donut1Ref = useRef(null);
  const donut2Ref = useRef(null);
  const barChart = useRef(null);
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
            { label: a.name.split(' ')[0], data: a.trend, backgroundColor: 'rgba(99,102,241,.70)', borderRadius: 4, borderSkipped: false },
            { label: b.name.split(' ')[0], data: b.trend, backgroundColor: 'rgba(239,68,68,.65)', borderRadius: 4, borderSkipped: false },
          ]
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.dataset.label + ': ' + ctx.raw + ' days' } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: 'rgba(180,200,240,.50)', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: 'rgba(180,200,240,.50)', font: { size: 10 }, stepSize: 1 }, beginAtZero: true }
          }
        }
      });
    }

    const donutOpts = {
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: 'rgba(180,200,240,.60)', font: { size: 10 }, padding: 8, boxWidth: 10 } },
        tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.raw + ' days' } }
      },
      cutout: '60%'
    };

    if (donut1Ref.current) {
      donut1Chart.current?.destroy();
      const d1 = donutData(a);
      donut1Chart.current = new Chart(donut1Ref.current, {
        type: 'doughnut',
        data: { labels: d1.labels, datasets: [{ data: d1.vals, backgroundColor: d1.colors.map(c => c + 'cc'), borderWidth: 0 }] },
        options: donutOpts
      });
    }

    if (donut2Ref.current) {
      donut2Chart.current?.destroy();
      const d2 = donutData(b);
      donut2Chart.current = new Chart(donut2Ref.current, {
        type: 'doughnut',
        data: { labels: d2.labels, datasets: [{ data: d2.vals, backgroundColor: d2.colors.map(c => c + 'cc'), borderWidth: 0 }] },
        options: donutOpts
      });
    }

    return () => {
      barChart.current?.destroy();
      donut1Chart.current?.destroy();
      donut2Chart.current?.destroy();
    };
  }, [emp1Id, emp2Id, setSearchParams]);

  const aAnnual = a.balance.find(x => x.name === 'Annual Leave');
  const bAnnual = b.balance.find(x => x.name === 'Annual Leave');
  const aSick = a.balance.find(x => x.name === 'Sick Leave');
  const bSick = b.balance.find(x => x.name === 'Sick Leave');
  const aTypes = a.balance.filter(x => x.used > 0).length;
  const bTypes = b.balance.filter(x => x.used > 0).length;

  return (
    <main className="main">
      <style>{`
        .emp-selector-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
        .emp-sel-card{border-radius:18px;padding:20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
        .sel-avatar{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0}
        .sel-name{font-size:14px;font-weight:700;color:rgba(220,230,255,.92);margin-bottom:2px}
        .sel-id{font-size:11px;color:rgba(180,200,240,.45);margin-bottom:4px}
        .sel-dept{font-size:11px;font-weight:600;color:rgba(160,180,240,.55)}
        .change-btn{margin-left:auto;padding:6px 14px;border-radius:10px;font-size:11px;font-weight:700;font-family:inherit;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:rgba(200,215,255,.70);cursor:pointer;transition:background .15s}
        .change-btn:hover{background:rgba(255,255,255,.13)}
        html.light .sel-name{color:rgba(15,23,42,.88)}
        html.light .sel-id{color:rgba(71,85,105,.50)}
        html.light .sel-dept{color:rgba(71,85,105,.50)}
        html.light .change-btn{background:rgba(255,255,255,.55);border-color:rgba(0,0,0,.10);color:rgba(30,41,59,.65)}
        .cmp-grid{border-radius:18px;overflow:hidden;margin-bottom:16px}
        .cmp-row{display:grid;grid-template-columns:1fr 200px 1fr;align-items:center;border-bottom:1px solid rgba(255,255,255,.06)}
        .cmp-row:last-child{border-bottom:none}
        .cmp-metric{font-size:11px;font-weight:700;color:rgba(180,200,240,.45);text-transform:uppercase;letter-spacing:.06em;text-align:center;padding:12px 8px;background:rgba(0,0,0,.10)}
        .cmp-val{font-size:16px;font-weight:800;padding:14px 20px;color:rgba(200,215,255,.80);display:flex;align-items:center;gap:8px}
        .cmp-val.left{justify-content:flex-end;text-align:right}
        .cmp-val.right{justify-content:flex-start;text-align:left}
        .cmp-val.winner{background:rgba(16,185,129,.08);color:#34d399;border-left:2px solid rgba(16,185,129,.35)}
        .cmp-val.winner.left{border-left:none;border-right:2px solid rgba(16,185,129,.35)}
        .cmp-row-head{background:rgba(99,102,241,.10);border-bottom:1px solid rgba(255,255,255,.08)}
        .cmp-head-cell{font-size:11px;font-weight:700;color:rgba(180,200,240,.50);text-transform:uppercase;letter-spacing:.06em;padding:10px 20px;text-align:center}
        html.light .cmp-metric{color:rgba(71,85,105,.55);background:rgba(0,0,0,.03)}
        html.light .cmp-val{color:rgba(30,41,59,.78)}
        html.light .cmp-val.winner{background:rgba(16,185,129,.07);color:#059669}
        html.light .cmp-head-cell{color:rgba(71,85,105,.55)}
        html.light .cmp-row{border-bottom-color:rgba(0,0,0,.05)}
        .charts-3col{display:grid;grid-template-columns:2fr 1fr 1fr;gap:16px;margin-bottom:16px}
        .chart-card{border-radius:18px;padding:20px}
        .donut-wrap{position:relative;height:180px;display:flex;align-items:center;justify-content:center}
        .hist-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .hist-card{border-radius:18px;padding:20px}
        .hist-item{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.06)}
        .hist-item:last-child{border-bottom:none}
        .hist-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
        .hist-type{font-size:12px;font-weight:600;color:rgba(200,215,255,.78);flex:1}
        .hist-dates{font-size:10px;color:rgba(180,200,240,.42);margin-top:1px}
        .hist-days{font-size:12px;font-weight:700;color:rgba(180,200,240,.55);white-space:nowrap}
        html.light .hist-type{color:rgba(30,41,59,.78)}
        html.light .hist-dates{color:rgba(71,85,105,.50)}
        html.light .hist-days{color:rgba(71,85,105,.55)}
        html.light .hist-item{border-bottom-color:rgba(0,0,0,.05)}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:500;display:flex;align-items:center;justify-content:center}
        .modal-box{width:340px;border-radius:20px;padding:24px;background:rgba(20,16,60,.95);border:1px solid rgba(255,255,255,.14);box-shadow:0 20px 60px rgba(0,0,0,.50)}
        html.light .modal-box{background:rgba(240,244,255,.97);border-color:rgba(0,0,0,.10)}
        .modal-title{font-size:15px;font-weight:800;margin-bottom:16px;color:rgba(220,230,255,.92)}
        html.light .modal-title{color:rgba(15,23,42,.88)}
        .modal-opt{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;cursor:pointer;transition:background .14s}
        .modal-opt:hover{background:rgba(255,255,255,.08)}
        html.light .modal-opt:hover{background:rgba(0,0,0,.05)}
        .modal-opt-av{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0}
        .modal-opt-name{font-size:13px;font-weight:700;color:rgba(200,215,255,.85)}
        .modal-opt-id{font-size:11px;color:rgba(180,200,240,.45);margin-top:1px}
        html.light .modal-opt-name{color:rgba(30,41,59,.80)}
        html.light .modal-opt-id{color:rgba(71,85,105,.45)}
        .modal-cancel{margin-top:12px;width:100%;padding:9px;border-radius:12px;font-size:13px;font-weight:700;font-family:inherit;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);color:rgba(180,200,240,.65);cursor:pointer}
        html.light .modal-cancel{background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.08);color:rgba(71,85,105,.65)}
        @media(max-width:900px){.charts-3col{grid-template-columns:1fr}.emp-selector-row{grid-template-columns:1fr}.hist-2col{grid-template-columns:1fr}}
        @media(max-width:600px){.cmp-val{font-size:13px;padding:10px 12px}.cmp-metric{font-size:10px;padding:10px 4px}}
      `}</style>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'24px'}}>
        <div>
          <div className="page-title">🔀 Compare Employees</div>
          <div className="page-sub">Side-by-side leave analysis</div>
        </div>
        <Link to="/employees" className="back-btn">← Back</Link>
      </div>

      {/* Selector row */}
      <div className="emp-selector-row">
        {[{ emp: a, slot: 1 }, { emp: b, slot: 2 }].map(({ emp, slot }) => (
          <div key={slot} className="emp-sel-card g">
            <div className="sel-avatar" style={{background:emp.color,boxShadow:`0 0 0 3px ${slot===1?'rgba(99,102,241,.35)':'rgba(239,68,68,.35)'},0 4px 14px rgba(0,0,0,.25)`}}>{initials(emp.name)}</div>
            <div style={{flex:1}}>
              <div className="sel-name">{emp.name}</div>
              <div className="sel-id">{emp.id}</div>
              <div className="sel-dept">{emp.dept}</div>
              <div style={{marginTop:'8px'}}>{statusBadge(emp.status)}</div>
            </div>
            <button className="change-btn" onClick={() => { setChangingSlot(slot); setModalOpen(true); }}>Change</button>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="cmp-grid g" style={{padding:0,overflow:'hidden',marginBottom:'16px'}}>
        <div className="cmp-row cmp-row-head">
          <div className="cmp-head-cell" style={{color:'#a5b4fc',fontSize:'12px'}}>{a.name}</div>
          <div className="cmp-head-cell">Metric</div>
          <div className="cmp-head-cell" style={{color:'#f87171',fontSize:'12px'}}>{b.name}</div>
        </div>
        <CmpRow metricLabel="Total Days This Year" va={a.stats.total} vb={b.stats.total} lowerBetter unit="days" />
        <CmpRow metricLabel="Annual Leave Used" va={aAnnual?.used||0} vb={bAnnual?.used||0} lowerBetter unit="days" />
        <CmpRow metricLabel="Sick Leave Used" va={aSick?.used||0} vb={bSick?.used||0} lowerBetter unit="days" />
        <CmpRow metricLabel="Remaining Balance" va={a.stats.remaining} vb={b.stats.remaining} lowerBetter={false} unit="days" />
        <CmpRow metricLabel="Longest Streak" va={a.stats.streak} vb={b.stats.streak} lowerBetter unit="days" />
        <CmpRow metricLabel="Avg Per Month" va={a.stats.avg} vb={b.stats.avg} lowerBetter unit="/ mo" />
        <CmpRow metricLabel="Leave Types Used" va={aTypes} vb={bTypes} lowerBetter />
        <div className="cmp-row">
          <div className="cmp-val left">{statusBadge(a.status)}</div>
          <div className="cmp-metric">Current Status</div>
          <div className="cmp-val right">{statusBadge(b.status)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-3col">
        <div className="chart-card g">
          <div className="sec-lbl">Monthly Leave Comparison</div>
          <div className="chart-wrap" style={{height:'240px'}}><canvas ref={barRef}></canvas></div>
          <div style={{display:'flex',gap:'18px',justifyContent:'center',marginTop:'12px'}}>
            <span style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',fontWeight:600,color:'rgba(180,200,240,.55)'}}><span style={{width:'12px',height:'12px',borderRadius:'3px',background:'rgba(99,102,241,.75)',display:'inline-block'}}></span>{a.name.split(' ')[0]}</span>
            <span style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',fontWeight:600,color:'rgba(180,200,240,.55)'}}><span style={{width:'12px',height:'12px',borderRadius:'3px',background:'rgba(239,68,68,.75)',display:'inline-block'}}></span>{b.name.split(' ')[0]}</span>
          </div>
        </div>
        <div className="chart-card g">
          <div className="sec-lbl">{a.name.split(' ')[0]} — Leave Types</div>
          <div className="donut-wrap"><canvas ref={donut1Ref}></canvas></div>
        </div>
        <div className="chart-card g">
          <div className="sec-lbl">{b.name.split(' ')[0]} — Leave Types</div>
          <div className="donut-wrap"><canvas ref={donut2Ref}></canvas></div>
        </div>
      </div>

      {/* History */}
      <div className="hist-2col">
        <div className="hist-card g">
          <div className="sec-lbl">{a.name.split(' ')[0]}'s Last Records</div>
          {histItems(a)}
        </div>
        <div className="hist-card g">
          <div className="sec-lbl">{b.name.split(' ')[0]}'s Last Records</div>
          {histItems(b)}
        </div>
      </div>

      {/* Change employee modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal-box">
            <div className="modal-title">Select Employee</div>
            <div>
              {Object.values(EMPS)
                .filter(e => e.id !== (changingSlot === 1 ? emp2Id : emp1Id))
                .map(e => (
                  <div key={e.id} className="modal-opt" onClick={() => {
                    if (changingSlot === 1) setEmp1Id(e.id);
                    else setEmp2Id(e.id);
                    setModalOpen(false);
                  }}>
                    <div className="modal-opt-av" style={{background:e.color}}>{initials(e.name)}</div>
                    <div>
                      <div className="modal-opt-name">{e.name}</div>
                      <div className="modal-opt-id">{e.id} · {e.dept}</div>
                    </div>
                  </div>
                ))}
            </div>
            <button className="modal-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}
