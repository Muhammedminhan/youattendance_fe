import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EMPS } from '../data/employees';

// TODO: replace with api call — derived from local data until API is wired
const EMP_LIST = Object.values(EMPS);
const ACTIVE_COUNT = EMP_LIST.length;
const ON_LEAVE_COUNT = EMP_LIST.filter(e => e.status === 'On Leave').length;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// Trend: sum all employees' leave per calendar month from their history
const TREND_VALS = MONTHS.map((_, mi) =>
  EMP_LIST.reduce((sum, e) =>
    sum + e.history.filter(h => {
      const d = new Date(h.from); return d.getMonth() === mi;
    }).reduce((s, h) => s + h.days, 0)
  , 0)
);

function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    function tick(ts) {
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setVal(target);
    }
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

function StatCard({ label, val, color, hint, trend, trendUp, icon, pct, pctLabel }) {
  const animated = useCountUp(val);
  return (
    <div className="stat-card g">
      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'14px'}}>
        <div style={{width:'48px',height:'48px',borderRadius:'14px',background:color,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 14px ${color.includes('6366f1')?'rgba(99,102,241,.35)':color.includes('ef4444')?'rgba(239,68,68,.35)':color.includes('f59e0b')?'rgba(245,158,11,.35)':'rgba(16,185,129,.35)'},0 0 0 1px rgba(255,255,255,.20) inset`,flexShrink:0}}>
          {icon}
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minWidth:'52px'}}>
          <div style={{fontSize:'15px',fontWeight:800,color:color.includes('6366f1')?'#6366f1':color.includes('ef4444')?'#ef4444':color.includes('f59e0b')?'#f59e0b':'#10b981'}}>{pct}</div>
          <div style={{fontSize:'9px',color:'rgba(80,100,140,.45)',fontWeight:600,letterSpacing:'.04em'}}>{pctLabel}</div>
        </div>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-val" style={{color:color.includes('6366f1')?'#6366f1':color.includes('ef4444')?'#ef4444':color.includes('f59e0b')?'#f59e0b':'#10b981'}}>{animated}</div>
      <div className="stat-hint">{hint}</div>
      <div className={`stat-trend ${trendUp?'trend-up':'trend-down'}`}>{trend}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading] = useState(false);
  const [error] = useState(null);
  const now = useLiveClock();
  const donutRef = useRef(null);
  const trendRef = useRef(null);
  const donutChartRef = useRef(null);
  const trendChartRef = useRef(null);

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">Failed to load data</div>;

  const h = now.getHours();
  const greeting = h < 12 ? 'Good morning 👋' : h < 17 ? 'Good afternoon ☀️' : 'Good evening 🌙';
  const dateStr = now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });

  useEffect(() => {
    // Donut chart
    if (!donutRef.current) return;
    if (donutChartRef.current) donutChartRef.current.destroy();
    donutChartRef.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Annual', 'Sick', 'Emergency', 'Unpaid', 'WFH'],
        datasets: [{
          data: [45, 22, 11, 8, 14],
          backgroundColor: ['rgba(99,102,241,.82)','rgba(239,68,68,.82)','rgba(245,158,11,.82)','rgba(148,163,184,.55)','rgba(16,185,129,.82)'],
          hoverBackgroundColor: ['rgba(99,102,241,1)','rgba(239,68,68,1)','rgba(245,158,11,1)','rgba(148,163,184,.80)','rgba(16,185,129,1)'],
          borderWidth: 3,
          borderColor: 'rgba(255,255,255,.90)',
          hoverBorderColor: '#ffffff',
          hoverOffset: 10,
          spacing: 2,
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: '72%',
        animation: { animateRotate: true, duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255,255,255,.92)', titleColor: 'rgba(20,24,50,.80)',
            bodyColor: 'rgba(60,80,120,.70)', borderColor: 'rgba(0,0,0,.08)', borderWidth: 1,
            padding: 12, cornerRadius: 12, titleFont: { size: 12, weight: '700' }, bodyFont: { size: 11 },
            callbacks: { label: ctx => `  ${ctx.raw} days  (${Math.round(ctx.raw/100*100)}%)` }
          }
        }
      },
      plugins: [{
        id: 'centerLabel',
        afterDraw(chart) {
          const { ctx, chartArea: { left, right, top, bottom } } = chart;
          const cx = (left + right) / 2, cy = (top + bottom) / 2;
          ctx.save();
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(20,24,50,.75)'; ctx.font = '800 26px Inter';
          ctx.fillText('100', cx, cy - 8);
          ctx.font = '600 10px Inter'; ctx.fillStyle = 'rgba(80,100,140,.50)';
          ctx.fillText('TOTAL DAYS', cx, cy + 12);
          ctx.restore();
        }
      }]
    });

    // Bar chart
    if (!trendRef.current) return;
    if (trendChartRef.current) trendChartRef.current.destroy();
    const avg = TREND_VALS.reduce((a,b)=>a+b,0)/TREND_VALS.length;
    const colors = TREND_VALS.map(v => v >= avg*1.4 ? 'rgba(239,68,68,.80)' : v >= avg ? 'rgba(245,158,11,.80)' : 'rgba(99,102,241,.75)');

    const avgLinePlugin = {
      id: 'avgLine',
      afterDraw(chart) {
        const { ctx, chartArea: { left, right }, scales: { y } } = chart;
        const yPos = y.getPixelForValue(avg);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(left, yPos); ctx.lineTo(right, yPos);
        ctx.strokeStyle = 'rgba(99,102,241,.40)'; ctx.lineWidth = 1.5; ctx.setLineDash([6,4]); ctx.stroke();
        const label = `avg ${avg.toFixed(1)}`;
        ctx.font = '700 10px Inter';
        const w = ctx.measureText(label).width + 16;
        const px = right - w - 4, py = yPos - 11, ph = 18, pr = 6;
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(99,102,241,.15)';
        ctx.beginPath(); ctx.roundRect(px, py, w, ph, pr); ctx.fill();
        ctx.fillStyle = 'rgba(99,102,241,.80)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(label, px + w/2, py + ph/2);
        ctx.restore();
      }
    };

    trendChartRef.current = new Chart(trendRef.current, {
      type: 'bar',
      data: {
        labels: MONTHS,
        datasets: [{ data: TREND_VALS, backgroundColor: colors, hoverBackgroundColor: colors.map(c => c.replace(/\.\d+\)$/, '1)')), borderRadius: { topLeft:8, topRight:8 }, borderSkipped: false, barPercentage: 0.68, categoryPercentage: 0.80 }]
      },
      options: {
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255,255,255,.92)', titleColor: 'rgba(20,24,50,.80)',
            bodyColor: 'rgba(60,80,120,.70)', borderColor: 'rgba(0,0,0,.08)', borderWidth: 1,
            padding: 12, cornerRadius: 12, titleFont: { size: 12, weight: '700' }, bodyFont: { size: 11 },
            callbacks: {
              title: ctx => ctx[0].label + ' 2026',
              label: ctx => `  ${ctx.raw} days on leave`,
              afterLabel: ctx => ctx.raw >= avg*1.4 ? '  ⚠ High volume' : ctx.raw >= avg ? '  ↑ Above average' : '  ✓ Below average',
            }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: 'rgba(60,80,120,.45)', font: { size: 10, weight: '600' }, padding: 6 } },
          y: { grid: { color: 'rgba(0,0,0,.06)', drawTicks: false }, border: { display: false, dash: [4,4] }, ticks: { color: 'rgba(60,80,120,.45)', font: { size: 10 }, padding: 8, maxTicksLimit: 5 }, beginAtZero: true }
        }
      },
      plugins: [avgLinePlugin]
    });

    return () => {
      donutChartRef.current?.destroy();
      trendChartRef.current?.destroy();
    };
  }, []);

  return (
    <main className="main">
      <style>{`
        .charts-row{display:grid;grid-template-columns:1fr 1.6fr;gap:18px;margin-bottom:24px}
        .card{border-radius:24px;padding:24px}
        .alert-btn{border-radius:16px;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:nowrap;cursor:pointer;text-decoration:none;color:inherit;transition:transform .22s ease,box-shadow .22s ease}
        .alert-btn:hover{transform:translateY(-3px);box-shadow:0 24px 60px rgba(100,110,160,.22),0 1px 0 rgba(255,255,255,.95) inset!important}
        html.dark .al-title{color:rgba(255,255,255,.92)}
        html.dark .al-sub{color:rgba(180,200,240,.45)}
        @media(max-width:900px){.charts-row{grid-template-columns:1fr}}
        .alert-title{font-size:13px;font-weight:800;letter-spacing:-.02em;color:rgba(20,24,40,.90)}
        html:not(.light) .alert-title{color:rgba(255,255,255,.92)}
        .alert-sub{font-size:11px;color:rgba(60,80,120,.55)}
        html:not(.light) .alert-sub{color:rgba(180,200,240,.55)}
      `}</style>

      {/* Continuous alerts banner */}
      <Link to="/alerts" className="alert-btn g" style={{textDecoration:'none',overflow:'hidden',marginBottom:'16px',position:'relative'}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,rgba(239,68,68,.06) 0%,transparent 60%)',pointerEvents:'none',zIndex:0}}></div>
        <div style={{display:'flex',alignItems:'center',gap:'12px',position:'relative',zIndex:1}}>
          <div style={{position:'relative',flexShrink:0}}>
            <div style={{width:'38px',height:'38px',borderRadius:'11px',background:'linear-gradient(135deg,#ef4444,#dc2626)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px rgba(239,68,68,.40),0 0 0 1px rgba(255,255,255,.20) inset'}}>
              <svg width="17" height="17" viewBox="0 0 22 22" fill="none"><path d="M11 2a6 6 0 0 1 6 6c0 3.5 1.5 5.5 2.5 6.5H2.5C3.5 13.5 5 11.5 5 8a6 6 0 0 1 6-6z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" fill="none" opacity=".95"/><path d="M9 17.5c.3.9 1 1.5 2 1.5s1.7-.6 2-1.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".85"/><circle cx="16" cy="4" r="3" fill="#fbbf24" stroke="white" strokeWidth="1.5"/><text x="16" y="5" textAnchor="middle" fontSize="4" fontWeight="800" fill="white">3</text></svg>
            </div>
            <div style={{position:'absolute',top:'-2px',right:'-2px',width:'9px',height:'9px',borderRadius:'50%',background:'#ef4444',border:'2px solid rgba(255,255,255,.90)',animation:'pulse-dot 1.6s infinite',boxShadow:'0 0 6px rgba(239,68,68,.70)'}}></div>
          </div>
          <div>
            <div className="alert-title">Continuous Leave Alerts</div>
            <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'2px'}}>
              <span className="alert-sub">3 employees on extended leave</span>
              <span style={{display:'flex',alignItems:'center',gap:'3px',padding:'1px 6px',borderRadius:'20px',background:'rgba(239,68,68,.10)',border:'1px solid rgba(239,68,68,.22)',fontSize:'9px',fontWeight:700,color:'#dc2626'}}>
                <span style={{width:'4px',height:'4px',borderRadius:'50%',background:'#ef4444',animation:'pulse-dot 1.6s infinite',display:'inline-block'}}></span>LIVE
              </span>
            </div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px',position:'relative',zIndex:1}}>
          <div style={{display:'flex',gap:'5px'}}>
            <span style={{display:'flex',alignItems:'center',gap:'4px',padding:'4px 10px',borderRadius:'20px',background:'rgba(239,68,68,.10)',border:'1px solid rgba(239,68,68,.22)',fontSize:'10px',fontWeight:700,color:'#dc2626'}}>Sick Priority</span>
            <span style={{display:'flex',alignItems:'center',gap:'4px',padding:'4px 10px',borderRadius:'20px',background:'rgba(245,158,11,.10)',border:'1px solid rgba(245,158,11,.22)',fontSize:'10px',fontWeight:700,color:'#b45309'}}>2 Extended</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'8px 16px',borderRadius:'11px',background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff',fontSize:'12px',fontWeight:700,boxShadow:'0 4px 14px rgba(239,68,68,.40),0 0 0 1px rgba(255,255,255,.15) inset',whiteSpace:'nowrap'}}>
            View 3 Alerts
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </Link>

      {/* Hero greeting */}
      <div style={{marginBottom:'28px'}}>
        <div className="g" style={{borderRadius:'22px',padding:'22px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'20px',flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
            <div style={{position:'relative',flexShrink:0}}>
              <div style={{width:'58px',height:'58px',borderRadius:'20px',background:'linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 24px rgba(99,102,241,.45),0 0 0 1px rgba(255,255,255,.30) inset'}}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  <text x="2" y="22" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="13" fill="#ffffff">YOU</text>
                  <polyline points="6,27 11,32 20,22" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="25" cy="24" r="1.5" fill="rgba(255,255,255,.70)"/>
                  <circle cx="30" cy="24" r="1.5" fill="rgba(255,255,255,.70)"/>
                  <circle cx="25" cy="29" r="1.5" fill="rgba(255,255,255,.70)"/>
                  <circle cx="30" cy="29" r="1.5" fill="rgba(255,255,255,.70)"/>
                </svg>
              </div>
              <div style={{position:'absolute',bottom:'-3px',right:'-3px',width:'14px',height:'14px',borderRadius:'50%',background:'linear-gradient(135deg,#10b981,#06b6d4)',border:'2px solid rgba(255,255,255,.90)'}}></div>
            </div>
            <div>
              <div className="hero-greeting" style={{fontSize:'24px',fontWeight:900,letterSpacing:'-.04em',lineHeight:1.1}}>{greeting}</div>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'5px'}}>
                <span style={{fontSize:'12px',color:'rgba(80,100,140,.55)',fontWeight:500}}>{dateStr}</span>
                <span style={{width:'3px',height:'3px',borderRadius:'50%',background:'rgba(80,100,140,.25)',display:'inline-block'}}></span>
                <div style={{display:'flex',alignItems:'center',gap:'4px',padding:'3px 10px',borderRadius:'8px',background:'rgba(99,102,241,.10)',border:'1px solid rgba(99,102,241,.18)'}}>
                  <span style={{fontSize:'12px',fontWeight:800,color:'rgba(99,102,241,.85)',fontVariantNumeric:'tabular-nums',letterSpacing:'.06em'}}>{timeStr}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 16px',borderRadius:'16px',background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.20)'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,#ef4444,#f97316)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="2.5" fill="white" opacity=".9"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".9"/></svg>
              </div>
              <div>
                <div style={{fontSize:'18px',fontWeight:800,color:'#dc2626',lineHeight:1}}>{Object.values(EMPS).filter(e => e.status === 'On Leave').length}</div>
                <div style={{fontSize:'10px',fontWeight:600,color:'rgba(80,100,140,.55)',textTransform:'uppercase',letterSpacing:'.05em'}}>On leave</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 16px',borderRadius:'16px',background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.20)'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,#f59e0b,#f97316)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l5.5 10H2.5L8 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity=".9"/><line x1="8" y1="7" x2="8" y2="9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11.5" r=".8" fill="white"/></svg>
              </div>
              <div>
                <div style={{fontSize:'18px',fontWeight:800,color:'#b45309',lineHeight:1}}>3</div>
                <div style={{fontSize:'10px',fontWeight:600,color:'rgba(80,100,140,.55)',textTransform:'uppercase',letterSpacing:'.05em'}}>Alerts</div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 16px',borderRadius:'16px',background:'rgba(16,185,129,.08)',border:'1px solid rgba(16,185,129,.20)'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'linear-gradient(135deg,#10b981,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2" fill="white" opacity=".8"/><path d="M1 14c0-2.76 2.01-5 4.5-5" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".8"/><circle cx="11" cy="5" r="2.5" fill="white" opacity=".95"/><path d="M6.5 14c0-2.76 2.01-5 4.5-5s4.5 2.24 4.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".95"/></svg>
              </div>
              <div>
                <div style={{fontSize:'18px',fontWeight:800,color:'#059669',lineHeight:1}}>{Object.values(EMPS).length}</div>
                <div style={{fontSize:'10px',fontWeight:600,color:'rgba(80,100,140,.55)',textTransform:'uppercase',letterSpacing:'.05em'}}>Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        <StatCard label="Active Employees" val={ACTIVE_COUNT} color="linear-gradient(135deg,#6366f1,#8b5cf6)" hint="across all departments" trend="↑ 3 from last month" trendUp pct="95%" pctLabel="capacity"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3.5" stroke="white" strokeWidth="1.8" fill="none" opacity=".95"/><path d="M2 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".95"/><circle cx="18" cy="8" r="2.5" stroke="white" strokeWidth="1.6" fill="none" opacity=".60"/><path d="M21.5 20c0-2.76-1.57-5.12-3.9-6.28" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".60"/></svg>}
        />
        <StatCard label="On Leave Today" val={ON_LEAVE_COUNT} color="linear-gradient(135deg,#ef4444,#f97316)" hint="5.6% of workforce" trend="↑ 2 from yesterday" trendUp pct="5.6%" pctLabel="of staff"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="3" stroke="white" strokeWidth="1.8" fill="none" opacity=".95"/><line x1="12" y1="4" x2="12" y2="5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".80"/><line x1="18" y1="10" x2="16.5" y2="10" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".80"/><line x1="6" y1="10" x2="7.5" y2="10" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".80"/><line x1="3" y1="17" x2="21" y2="17" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".70"/><path d="M4 20 Q6.5 18.5 9 20 Q11.5 21.5 14 20 Q16.5 18.5 19 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".90"/></svg>}
        />
        <StatCard label="On Leave This Week" val={23} color="linear-gradient(135deg,#f59e0b,#f97316)" hint="Mon – Fri" trend="↓ 1 from last week" trendUp={false} pct="16%" pctLabel="this week"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="white" strokeWidth="1.8" fill="none" opacity=".95"/><path d="M3 10h18" stroke="white" strokeWidth="1.4" opacity=".50"/><line x1="8" y1="3" x2="8" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".90"/><line x1="16" y1="3" x2="16" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".90"/><circle cx="7" cy="14.5" r="1.2" fill="white" opacity=".90"/><circle cx="10" cy="14.5" r="1.2" fill="white" opacity=".90"/><circle cx="13" cy="14.5" r="1.2" fill="white" opacity=".90"/></svg>}
        />
        <StatCard label="On Leave This Month" val={41} color="linear-gradient(135deg,#10b981,#06b6d4)" hint="July 2026" trend="↑ 5 from June" trendUp pct="29%" pctLabel="this month"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="white" strokeWidth="1.8" fill="none" opacity=".95"/><path d="M3 10h18" stroke="white" strokeWidth="1.4" opacity=".50"/><line x1="8" y1="3" x2="8" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".90"/><line x1="16" y1="3" x2="16" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".90"/><rect x="6" y="13" width="3.5" height="3.5" rx="1" fill="white" opacity=".90"/><rect x="10.3" y="13" width="3.5" height="3.5" rx="1" fill="white" opacity=".70"/><rect x="14.6" y="13" width="3.5" height="3.5" rx="1" fill="white" opacity=".50"/></svg>}
        />
      </div>

      {/* Charts */}
      <div className="charts-row">
        <div className="card g" style={{display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'6px'}}>
            <div><div className="sec-lbl" style={{marginBottom:'2px'}}>Leave by Type</div><div style={{fontSize:'11px',color:'rgba(80,100,140,.45)'}}>Current year distribution</div></div>
            <div style={{textAlign:'right'}}><div style={{fontSize:'22px',fontWeight:800,color:'rgba(20,24,50,.75)'}}>100</div><div style={{fontSize:'9px',color:'rgba(80,100,140,.45)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em'}}>total days</div></div>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginBottom:'12px'}}>
            {[['#6366f1','Annual 45%'],['#ef4444','Sick 22%'],['#f59e0b','Emergency 11%'],['#10b981','WFH 14%'],['#94a3b8','Unpaid 8%']].map(([c,l]) => (
              <span key={l} style={{display:'flex',alignItems:'center',gap:'4px',padding:'3px 10px',borderRadius:'20px',background:`rgba(${c==='#6366f1'?'99,102,241':c==='#ef4444'?'239,68,68':c==='#f59e0b'?'245,158,11':c==='#10b981'?'16,185,129':'148,163,184'},.10)`,border:`1px solid rgba(${c==='#6366f1'?'99,102,241':c==='#ef4444'?'239,68,68':c==='#f59e0b'?'245,158,11':c==='#10b981'?'16,185,129':'148,163,184'},.20)`,fontSize:'10px',fontWeight:700,color:c}}>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:c,display:'inline-block'}}></span>{l}
              </span>
            ))}
          </div>
          <div className="chart-wrap" style={{height:'190px',flex:1}}><canvas ref={donutRef}></canvas></div>
        </div>

        <div className="card g" style={{display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><div className="sec-lbl" style={{marginBottom:'2px'}}>Monthly Leave Trend</div><div style={{fontSize:'11px',color:'rgba(80,100,140,.45)'}}>Days taken per month — 2026</div></div>
            <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'10px',height:'10px',borderRadius:'3px',background:'#6366f1',display:'inline-block',opacity:.75}}></span><span style={{fontSize:'10px',color:'rgba(80,100,140,.55)',fontWeight:600}}>Below avg</span></div>
              <div style={{display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'10px',height:'10px',borderRadius:'3px',background:'#f59e0b',display:'inline-block',opacity:.75}}></span><span style={{fontSize:'10px',color:'rgba(80,100,140,.55)',fontWeight:600}}>Above avg</span></div>
              <div style={{display:'flex',alignItems:'center',gap:'5px'}}><span style={{width:'10px',height:'10px',borderRadius:'3px',background:'#ef4444',display:'inline-block',opacity:.75}}></span><span style={{fontSize:'10px',color:'rgba(80,100,140,.55)',fontWeight:600}}>High</span></div>
            </div>
          </div>
          <div className="chart-wrap" style={{height:'215px',flex:1}}><canvas ref={trendRef}></canvas></div>
        </div>
      </div>
    </main>
  );
}
