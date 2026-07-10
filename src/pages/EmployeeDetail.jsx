import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { EMPS, ALL } from '../data/employees';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// TODO: replace with api call
export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const emp = EMPS[id] || EMPS.EMP001;
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [searchHist, setSearchHist] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState(ALL.find(e => e.id !== emp.id)?.id || 'EMP002');

  const initials = emp.name.split(' ').map(w => w[0]).join('').slice(0,2);
  const badgeMap = { 'On Leave': 'badge-red', 'Active': 'badge-green', 'Low Balance': 'badge-amber' };

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
        ctx.strokeStyle = 'rgba(167,139,250,.55)'; ctx.lineWidth = 1.5; ctx.setLineDash([5,4]); ctx.stroke();
        ctx.fillStyle = 'rgba(167,139,250,.80)'; ctx.font = '10px Inter';
        ctx.fillText('avg ' + avg.toFixed(1), right-50, yp-5);
        ctx.restore();
      }
    };
    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          data: tv,
          backgroundColor: tv.map(v => v===0?'rgba(100,116,139,.22)':v>=avg*1.4?'rgba(239,68,68,.70)':v>=avg?'rgba(245,158,11,.65)':'rgba(99,102,241,.65)'),
          borderRadius: 5, borderSkipped: false
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.raw} days` } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: 'rgba(180,200,240,.50)', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: 'rgba(180,200,240,.50)', font: { size: 10 }, stepSize: 1 }, beginAtZero: true }
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
        .hero::before{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.12) 0%,transparent 60%);pointer-events:none}
        .hero::after{content:'';position:absolute;top:-60px;right:-60px;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none}
        .hero-av{width:72px;height:72px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:#fff;flex-shrink:0;background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.40);box-shadow:0 8px 24px rgba(0,0,0,.25),0 0 0 4px rgba(255,255,255,.12)}
        .hero-name{font-size:22px;font-weight:900;color:#fff;letter-spacing:-.03em}
        .hero-meta{font-size:12px;color:rgba(255,255,255,.60);margin-top:5px;font-weight:500}
        .hero-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
        .hero-btn{display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:14px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;border:1.5px solid rgba(255,255,255,.35);background:rgba(255,255,255,.18);color:#fff;transition:all .18s;backdrop-filter:blur(8px)}
        .hero-btn:hover{background:rgba(255,255,255,.28)}
        .mini-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
        .ms-card{border-radius:16px;padding:16px 18px}
        .ms-label{font-size:11px;font-weight:700;color:rgba(180,200,240,.45);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
        .ms-val{font-size:28px;font-weight:800;letter-spacing:-.03em;line-height:1}
        .ms-sub{font-size:11px;color:rgba(180,200,240,.40);margin-top:4px}
        html.light .ms-label{color:rgba(71,85,105,.55)}
        html.light .ms-sub{color:rgba(71,85,105,.45)}
        .two-col{display:grid;grid-template-columns:1fr 1.4fr;gap:16px;margin-bottom:16px}
        .detail-card{border-radius:18px;padding:22px}
        .bal-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
        .bal-name{font-size:13px;font-weight:600;color:rgba(200,215,255,.85)}
        .bal-info{font-size:12px;color:rgba(180,200,240,.55)}
        .bal-bg{height:10px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden;margin-bottom:14px}
        .bal-fill{height:100%;border-radius:5px}
        html.light .bal-name{color:rgba(30,41,59,.80)}
        html.light .bal-info{color:rgba(71,85,105,.55)}
        html.light .bal-bg{background:rgba(0,0,0,.08)}
        .cmp-select{width:100%;padding:10px 14px;border-radius:12px;font-size:13px;font-family:inherit;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:rgba(220,230,255,.90);outline:none;margin:14px 0}
        html.light .cmp-select{background:rgba(255,255,255,.65);border-color:rgba(0,0,0,.12);color:rgba(15,23,42,.85)}
        .cmp-btn{padding:11px 28px;border-radius:13px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;border:none;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff}
        .tbl-wrap{overflow-x:auto}
        @media(max-width:780px){.two-col{grid-template-columns:1fr}.mini-stats{grid-template-columns:repeat(2,1fr)}}
        .rpt-overlay{display:none;position:fixed;inset:0;z-index:600;background:rgba(1,4,9,.80);backdrop-filter:blur(6px);align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto}
        .rpt-overlay.open{display:flex}
        #rpt-box{background:#fff;color:#111;border-radius:20px;width:720px;max-width:100%;box-shadow:0 32px 80px rgba(0,0,0,.70);overflow:hidden;font-family:'Inter',sans-serif}
        .rpt-toolbar{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:14px 20px;display:flex;align-items:center;justify-content:space-between}
        .rpt-toolbar-title{font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em}
        .rpt-close-btn{padding:7px 14px;border-radius:8px;background:#f1f5f9;border:1px solid #e2e8f0;font-size:12px;font-weight:700;color:#475569;cursor:pointer;font-family:inherit}
        .rpt-body{padding:36px 40px}
      `}</style>

      <Link to="/employees" className="back-btn" style={{display:'inline-flex',marginBottom:'20px'}}>← Back to Employees</Link>

      {/* Hero */}
      <div className="hero g" style={{background:emp.color}}>
        <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
          <div className="hero-av">{initials}</div>
          <div>
            <div className="hero-name">{emp.name}</div>
            <div className="hero-meta">{emp.id} · {emp.dept} · Joined {emp.joined}</div>
            <div className="hero-badges">
              <span className={`badge ${badgeMap[emp.status]||'badge-gray'}`}>{emp.status}</span>
              <span className="badge badge-blue">{emp.stats.total} days this year</span>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
          <button className="hero-btn" onClick={() => setReportOpen(true)}>
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            Download Report
          </button>
        </div>
      </div>

      {/* Mini stats */}
      <div className="mini-stats">
        {[
          { label: 'Total Days This Year', val: emp.stats.total, color: '#a5b4fc', sub: 'days taken', bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', labelColor: 'rgba(99,102,241,.75)' },
          { label: 'Remaining Balance', val: emp.stats.remaining, color: '#34d399', sub: 'days left', bg: 'linear-gradient(135deg,#10b981,#059669)', labelColor: 'rgba(16,185,129,.75)' },
          { label: 'Longest Streak', val: emp.stats.streak, color: '#f87171', sub: 'consecutive days', bg: 'linear-gradient(135deg,#ef4444,#dc2626)', labelColor: 'rgba(239,68,68,.75)' },
          { label: 'Avg Per Month', val: emp.stats.avg, color: '#fbbf24', sub: 'days / month', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', labelColor: 'rgba(245,158,11,.75)' },
        ].map(s => (
          <div key={s.label} className="ms-card g" style={{padding:'18px 20px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'14px'}}>
              <div style={{width:'42px',height:'42px',borderRadius:'12px',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}></div>
              <div style={{fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:s.labelColor}}>{s.label}</div>
            </div>
            <div className="ms-val" style={{color:s.color,fontSize:'32px'}}>{s.val}</div>
            <div className="ms-sub" style={{marginTop:'6px'}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two-col: balance + chart */}
      <div className="two-col">
        <div className="detail-card g">
          <div className="sec-lbl">Leave Balance</div>
          {emp.balance.map(b => {
            const p = Math.round(b.used / b.max * 100);
            return (
              <div key={b.name}>
                <div className="bal-row"><span className="bal-name">{b.name}</span><span className="bal-info">{b.used}/{b.max} &nbsp;{p}%</span></div>
                <div className="bal-bg"><div className="bal-fill" style={{width:`${p}%`,background:b.color}}></div></div>
              </div>
            );
          })}
        </div>
        <div className="detail-card g">
          <div className="sec-lbl">Monthly Leave Trend</div>
          <div style={{position:'relative',height:'220px'}}><canvas ref={chartRef}></canvas></div>
        </div>
      </div>

      {/* Leave history */}
      <div className="detail-card g" style={{marginBottom:'16px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px',flexWrap:'wrap',gap:'10px'}}>
          <div className="sec-lbl" style={{marginBottom:0}}>Leave History</div>
          <input className="search-inp" placeholder="🔍 Search…" style={{maxWidth:'220px'}} value={searchHist} onChange={e => setSearchHist(e.target.value)}/>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr></thead>
            <tbody>
              {filteredHistory.map((r, i) => (
                <tr key={i}>
                  <td><span style={{width:'8px',height:'8px',borderRadius:'50%',background:r.color,display:'inline-block',marginRight:'7px'}}></span>{r.type}</td>
                  <td>{r.from}</td><td>{r.to}</td><td>{r.days}</td>
                  <td>{r.status === 'Active' ? <span className="badge badge-red">Active</span> : <span className="badge badge-gray">Completed</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compare */}
      <div className="detail-card g">
        <div className="sec-lbl">🔀 Compare with Another Employee</div>
        <p style={{fontSize:'13px',color:'rgba(180,200,240,.55)',marginBottom:0}}>Select a colleague to view a side-by-side leave comparison.</p>
        <select className="cmp-select" value={compareTarget} onChange={e => setCompareTarget(e.target.value)}>
          {ALL.filter(e => e.id !== emp.id).map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
          ))}
        </select>
        <button className="cmp-btn" onClick={() => navigate(`/compare?emp1=${emp.id}&emp2=${compareTarget}`)}>Compare Side by Side →</button>
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <div className="rpt-overlay open" onClick={e => { if (e.target === e.currentTarget) setReportOpen(false); }}>
          <div id="rpt-box">
            <div className="rpt-toolbar">
              <span className="rpt-toolbar-title">📄 Employee Report</span>
              <div style={{display:'flex',gap:'8px'}}>
                <button className="rpt-close-btn" onClick={() => setReportOpen(false)}>✕ Close</button>
                <button style={{padding:'7px 16px',borderRadius:'8px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',fontSize:'12px',fontWeight:700,color:'#fff',cursor:'pointer',fontFamily:'inherit'}} onClick={() => window.print()}>📥 Print PDF</button>
              </div>
            </div>
            <div className="rpt-body">
              <div style={{display:'flex',alignItems:'center',gap:'20px',marginBottom:'28px',paddingBottom:'24px',borderBottom:'2px solid #f1f5f9'}}>
                <div style={{width:'72px',height:'72px',borderRadius:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'26px',fontWeight:800,color:'#fff',flexShrink:0,background:'#6366f1'}}>{initials}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'22px',fontWeight:800,color:'#0f172a',letterSpacing:'-.02em'}}>{emp.name}</div>
                  <div style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}>{emp.id} · {emp.dept} · Joined {emp.joined}</div>
                  <span style={{display:'inline-block',marginTop:'8px',padding:'3px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:'#fee2e2',color:'#dc2626'}}>{emp.status}</span>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'24px'}}>
                {[['Days This Year', emp.stats.total, '#6366f1'],['Remaining', emp.stats.remaining, '#10b981'],['Longest Streak', emp.stats.streak, '#ef4444'],['Avg/Month', emp.stats.avg, '#f59e0b']].map(([l,v,c]) => (
                  <div key={l} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'14px',textAlign:'center'}}>
                    <div style={{fontSize:'24px',fontWeight:800,color:c,letterSpacing:'-.02em'}}>{v}</div>
                    <div style={{fontSize:'10px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.06em',marginTop:'4px'}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:'22px'}}>
                <div style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'12px',paddingBottom:'6px',borderBottom:'1px solid #f1f5f9'}}>Leave Balance</div>
                {emp.balance.map(b => {
                  const p = Math.round(b.used/b.max*100);
                  return (
                    <div key={b.name} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                      <div style={{fontSize:'13px',fontWeight:600,color:'#334155',width:'120px',flexShrink:0}}>{b.name}</div>
                      <div style={{flex:1,height:'8px',background:'#f1f5f9',borderRadius:'4px',overflow:'hidden'}}><div style={{height:'100%',borderRadius:'4px',width:`${p}%`,background:b.color}}></div></div>
                      <div style={{fontSize:'12px',color:'#94a3b8',width:'70px',textAlign:'right',flexShrink:0}}>{b.used}/{b.max} days</div>
                    </div>
                  );
                })}
              </div>
              <div>
                <div style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:'12px',paddingBottom:'6px',borderBottom:'1px solid #f1f5f9'}}>Leave History</div>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                  <thead><tr>{['Type','From','To','Days','Status'].map(h=><th key={h} style={{background:'#f8fafc',padding:'8px 12px',textAlign:'left',fontSize:'10px',fontWeight:700,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'.06em',borderBottom:'1px solid #e2e8f0'}}>{h}</th>)}</tr></thead>
                  <tbody>{emp.history.map((r,i)=><tr key={i}><td style={{padding:'9px 12px',borderBottom:'1px solid #f8fafc',color:'#334155'}}>{r.type}</td><td style={{padding:'9px 12px',borderBottom:'1px solid #f8fafc',color:'#334155'}}>{r.from}</td><td style={{padding:'9px 12px',borderBottom:'1px solid #f8fafc',color:'#334155'}}>{r.to}</td><td style={{padding:'9px 12px',borderBottom:'1px solid #f8fafc',color:'#334155',textAlign:'center',fontWeight:700}}>{r.days}</td><td style={{padding:'9px 12px',borderBottom:'1px solid #f8fafc',color:'#334155'}}><span style={{padding:'2px 10px',borderRadius:'20px',fontSize:'10px',fontWeight:700,background:r.status==='Active'?'#fee2e2':'#f1f5f9',color:r.status==='Active'?'#dc2626':'#64748b'}}>{r.status}</span></td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
