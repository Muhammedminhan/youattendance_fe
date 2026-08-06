import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { EMPS } from '../data/employees';

Chart.register(...registerables);

const EMP_LIST = Object.values(EMPS);
const ACTIVE_COUNT = EMP_LIST.length;
const ON_LEAVE_COUNT = EMP_LIST.filter(e => e.status === 'On Leave').length;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
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

const PALETTES = {
  cobalt: { bg:'linear-gradient(135deg,#2563EB,#1E40AF)', text:'#1D4ED8', shadow:'rgba(29,78,216,.28)',  blob:'rgba(29,78,216,.06)',  rgb:'29,78,216'   },
  rose:   { bg:'linear-gradient(135deg,#E11D48,#9F1239)', text:'#BE123C', shadow:'rgba(190,18,60,.24)',  blob:'rgba(190,18,60,.06)',  rgb:'190,18,60'   },
  amber:  { bg:'linear-gradient(135deg,#D97706,#92400E)', text:'#B45309', shadow:'rgba(180,83,9,.24)',   blob:'rgba(180,83,9,.06)',   rgb:'180,83,9'    },
  teal:   { bg:'linear-gradient(135deg,#0891B2,#0E7490)', text:'#0E7490', shadow:'rgba(14,116,144,.24)', blob:'rgba(14,116,144,.06)', rgb:'14,116,144'  },
};

function getPalette(color) {
  return PALETTES[color] || PALETTES.cobalt;
}

function StatCard({ label, val, color, hint, trend, trendUp, icon, pct, pctLabel }) {
  const animated = useCountUp(val);
  const p = getPalette(color);
  const pctNum = parseFloat(pct);

  return (
    <div className="stat-card g stat-card-hover">
      {/* Large background blob */}
      <div style={{position:'absolute',top:'-30px',right:'-30px',width:'110px',height:'110px',borderRadius:'50%',background:p.bg,opacity:.07,pointerEvents:'none',transition:'opacity .3s'}} className="stat-blob" />
      {/* Small accent dot */}
      <div style={{position:'absolute',bottom:'18px',right:'16px',width:'60px',height:'60px',borderRadius:'50%',background:p.bg,opacity:.04,pointerEvents:'none'}} />

      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'12px',position:'relative'}}>
        <div style={{width:'48px',height:'48px',borderRadius:'14px',background:p.bg,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 18px ${p.shadow}`,flexShrink:0,transition:'box-shadow .25s,transform .25s'}} className="stat-icon">
          {icon}
        </div>
        {/* Mini circular % badge */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'2px'}}>
          <div style={{position:'relative',width:'42px',height:'42px'}}>
            <svg width="42" height="42" viewBox="0 0 42 42" style={{transform:'rotate(-90deg)'}}>
              <circle cx="21" cy="21" r="16" fill="none" stroke={`rgba(${p.rgb},.10)`} strokeWidth="3.5"/>
              <circle cx="21" cy="21" r="16" fill="none" stroke={`rgba(${p.rgb},.60)`} strokeWidth="3.5"
                strokeDasharray={`${2*Math.PI*16}`}
                strokeDashoffset={`${2*Math.PI*16*(1 - pctNum/100)}`}
                strokeLinecap="round"
                style={{transition:'stroke-dashoffset 1.2s cubic-bezier(.25,.46,.45,.94)'}}
              />
            </svg>
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
              <span style={{fontSize:'10px',fontWeight:800,color:p.text,lineHeight:1}}>{pct}</span>
            </div>
          </div>
          <div style={{fontSize:'9px',color:'rgba(80,100,140,.38)',fontWeight:600,letterSpacing:'.05em',textTransform:'uppercase'}}>{pctLabel}</div>
        </div>
      </div>

      <div className="stat-label" style={{position:'relative'}}>{label}</div>
      <div className="stat-val" style={{color:p.text,position:'relative'}}>{animated}</div>
      <div className="stat-hint" style={{position:'relative'}}>{hint}</div>
      <div className={`stat-trend ${trendUp?'trend-up':'trend-down'}`} style={{position:'relative'}}>{trend}</div>

      {/* Progress bar strip at bottom */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'3px',background:p.bg,borderRadius:'0 0 18px 18px',opacity:.22}}/>
      <div style={{position:'absolute',bottom:0,left:0,height:'3px',background:p.bg,borderRadius:'0 0 0 18px',width:`${pctNum}%`,opacity:.72,transition:'width 1.4s cubic-bezier(.25,.46,.45,.94)'}}/>
    </div>
  );
}

const DONUT_DATA = [
  { label:'Annual',    pct:45, color:'#2563EB', rgb:'37,99,235'    },
  { label:'Sick',      pct:22, color:'#E11D48', rgb:'225,29,72'    },
  { label:'Emergency', pct:11, color:'#D97706', rgb:'217,119,6'    },
  { label:'WFH',       pct:14, color:'#059669', rgb:'5,150,105'    },
  { label:'Unpaid',    pct:8,  color:'#7C3AED', rgb:'124,58,237'   },
];

export default function Dashboard() {
  const { user } = useAuth();
  const now = useLiveClock();
  const donutRef = useRef(null);
  const trendRef = useRef(null);
  const donutChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const [hiddenSegments, setHiddenSegments] = useState([]);
  const [period, setPeriod] = useState('year');

  const h = now.getHours();
  const greeting = h < 12 ? 'Good morning 👋' : h < 17 ? 'Good afternoon ☀️' : 'Good evening 🌙';
  const dateStr = now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });

  // Filtered data for period selector
  const periodSlice = period === '3m' ? 3 : period === '6m' ? 6 : 12;
  const filteredMonths = MONTHS.slice(0, periodSlice);
  const filteredVals   = TREND_VALS.slice(0, periodSlice);

  // Build donut chart
  useEffect(() => {
    if (!donutRef.current) return;
    if (donutChartRef.current) donutChartRef.current.destroy();

    const visibleData  = DONUT_DATA.map((d, i) => hiddenSegments.includes(i) ? 0 : (d.pct * 100) / 100 * 100);
    const totalDays = DONUT_DATA.reduce((s, d, i) => hiddenSegments.includes(i) ? s : s + d.pct, 0);

    donutChartRef.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: DONUT_DATA.map(d => d.label),
        datasets: [{
          data: visibleData,
          backgroundColor: DONUT_DATA.map(d => `rgba(${d.rgb},.82)`),
          hoverBackgroundColor: DONUT_DATA.map(d => `rgba(${d.rgb},1)`),
          borderWidth: 3,
          borderColor: 'rgba(255,255,255,.90)',
          hoverBorderColor: '#ffffff',
          hoverOffset: 12,
          spacing: 2,
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutout: '74%',
        animation: { animateRotate: true, duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255,255,255,.96)', titleColor: 'rgba(20,24,50,.82)',
            bodyColor: 'rgba(60,80,120,.68)', borderColor: 'rgba(0,0,0,.08)', borderWidth: 1,
            padding: 14, cornerRadius: 14, titleFont: { size: 12, weight: '700' }, bodyFont: { size: 11 },
            callbacks: { label: ctx => `  ${ctx.raw} days  (${ctx.raw}%)` }
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
          ctx.fillStyle = 'rgba(20,24,50,.80)'; ctx.font = '800 28px Inter,sans-serif';
          ctx.fillText(totalDays, cx, cy - 9);
          ctx.font = '600 9.5px Inter,sans-serif'; ctx.fillStyle = 'rgba(80,100,140,.48)'; ctx.letterSpacing = '1px';
          ctx.fillText('TOTAL DAYS', cx, cy + 13);
          ctx.restore();
        }
      }]
    });
    return () => donutChartRef.current?.destroy();
  }, [hiddenSegments]);

  // Build bar chart
  useEffect(() => {
    if (!trendRef.current) return;
    if (trendChartRef.current) trendChartRef.current.destroy();

    const avg = filteredVals.reduce((a,b)=>a+b,0) / filteredVals.length;
    const canvas = trendRef.current;
    const ctx = canvas.getContext('2d');

    const gradientColors = filteredVals.map(v => {
      const isHigh = v >= avg * 1.4;
      const isAbove = v >= avg;
      const [r, g, b] = isHigh ? [225,29,72] : isAbove ? [217,119,6] : [37,99,235];
      const grad = ctx.createLinearGradient(0, 0, 0, 240);
      grad.addColorStop(0, `rgba(${r},${g},${b},.92)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},.18)`);
      return grad;
    });

    const hoverColors = filteredVals.map(v => {
      const isHigh = v >= avg * 1.4;
      const isAbove = v >= avg;
      const [r, g, b] = isHigh ? [225,29,72] : isAbove ? [217,119,6] : [37,99,235];
      const grad = ctx.createLinearGradient(0, 0, 0, 240);
      grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},.45)`);
      return grad;
    });

    const avgLinePlugin = {
      id: 'avgLine',
      afterDraw(chart) {
        const { ctx: c, chartArea: { left, right }, scales: { y } } = chart;
        const yPos = y.getPixelForValue(avg);
        c.save();
        c.beginPath(); c.moveTo(left, yPos); c.lineTo(right, yPos);
        c.strokeStyle = 'rgba(37,99,235,.35)'; c.lineWidth = 1.5; c.setLineDash([5,4]); c.stroke();
        const label = `avg ${avg.toFixed(1)}`;
        c.font = '700 10px Inter,sans-serif';
        const w = c.measureText(label).width + 18;
        const px = right - w - 4, py = yPos - 12, ph = 20, pr = 6;
        c.setLineDash([]);
        c.fillStyle = 'rgba(37,99,235,.12)';
        c.beginPath(); c.roundRect(px, py, w, ph, pr); c.fill();
        c.fillStyle = 'rgba(37,99,235,.80)'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(label, px + w/2, py + ph/2);
        c.restore();
      }
    };

    trendChartRef.current = new Chart(trendRef.current, {
      type: 'bar',
      data: {
        labels: filteredMonths,
        datasets: [{
          data: filteredVals,
          backgroundColor: gradientColors,
          hoverBackgroundColor: hoverColors,
          borderRadius: { topLeft:8, topRight:8 },
          borderSkipped: false,
          barPercentage: 0.68,
          categoryPercentage: 0.80,
          borderWidth: 0,
        }]
      },
      options: {
        maintainAspectRatio: false,
        animation: { duration: 700, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(255,255,255,.96)', titleColor: 'rgba(20,24,50,.82)',
            bodyColor: 'rgba(60,80,120,.68)', borderColor: 'rgba(0,0,0,.08)', borderWidth: 1,
            padding: 14, cornerRadius: 14, titleFont: { size: 12, weight: '700' }, bodyFont: { size: 11 },
            callbacks: {
              title: ctx => ctx[0].label + ' 2026',
              label: ctx => `  ${ctx.raw} days on leave`,
              afterLabel: ctx => {
                const v = ctx.raw, a = avg;
                return v >= a*1.4 ? '  ⚠ High volume' : v >= a ? '  ↑ Above average' : '  ✓ Below average';
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { color: 'rgba(60,80,120,.45)', font: { size: 10, weight: '600' }, padding: 6 }
          },
          y: {
            grid: { color: 'rgba(0,0,0,.05)', drawTicks: false },
            border: { display: false, dash: [4,4] },
            ticks: { color: 'rgba(60,80,120,.42)', font: { size: 10 }, padding: 8, maxTicksLimit: 5 },
            beginAtZero: true
          }
        }
      },
      plugins: [avgLinePlugin]
    });
    return () => trendChartRef.current?.destroy();
  }, [period]);

  const toggleSegment = (idx) => {
    setHiddenSegments(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <main className="main">
      <style>{`
        .charts-row{display:grid;grid-template-columns:1fr 1.65fr;gap:14px;margin-bottom:16px;align-items:start}
        .card{border-radius:20px;padding:20px 22px}
        @media(max-width:900px){.charts-row{grid-template-columns:1fr}}
        .stat-card-hover{transition:transform .22s cubic-bezier(.34,1.2,.64,1),box-shadow .22s ease}
        .stat-card-hover:hover{transform:translateY(-5px)}
        html.light .stat-card-hover:hover{box-shadow:0 12px 40px rgba(99,102,241,.16),0 4px 12px rgba(99,102,241,.10)!important}
        .stat-card-hover:hover .stat-icon{transform:scale(1.08);box-shadow-override:yes}
        .stat-card-hover:hover .stat-blob{opacity:.13!important}
        .period-btn{padding:4px 12px;border-radius:8px;font-size:10px;font-weight:700;cursor:pointer;border:1px solid transparent;transition:all .15s;letter-spacing:.04em}
        html.light .period-btn{color:rgba(60,80,120,.55);background:transparent;border-color:transparent}
        html.light .period-btn:hover{background:rgba(99,102,241,.08);border-color:rgba(99,102,241,.15);color:rgba(60,80,120,.85)}
        html.light .period-btn.active{background:rgba(99,102,241,.12);border-color:rgba(99,102,241,.22);color:#4f46e5}
        .legend-pill{display:flex;align-items:center;gap:5px;padding:4px 11px;border-radius:20px;font-size:10px;font-weight:700;cursor:pointer;transition:all .15s;user-select:none;border:1px solid transparent}
        .legend-pill:hover{transform:translateY(-1px)}
        .chart-section-icon{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
      `}</style>

      {/* Hero greeting */}
      <div style={{marginBottom:'14px'}}>
        <div className="g" style={{borderRadius:'20px',padding:'18px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px',flexWrap:'wrap',background:'linear-gradient(120deg,rgba(99,102,241,.10) 0%,rgba(139,92,246,.05) 45%,rgba(255,255,255,0) 75%)',borderLeft:'3px solid rgba(99,102,241,.25)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <div style={{position:'relative',flexShrink:0}}>
              <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 20px rgba(99,102,241,.40),0 0 0 1px rgba(255,255,255,.25) inset'}}>
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
              <div className="hero-greeting" style={{fontSize:'26px',fontWeight:900,letterSpacing:'-.04em',lineHeight:1.1}}>{greeting}</div>
              <div style={{display:'flex',alignItems:'center',gap:'10px',marginTop:'5px'}}>
                <span style={{fontSize:'12px',color:'rgba(80,100,140,.55)',fontWeight:500}}>{dateStr}</span>
                <span style={{width:'3px',height:'3px',borderRadius:'50%',background:'rgba(80,100,140,.25)',display:'inline-block'}}></span>
                <div style={{display:'flex',alignItems:'center',gap:'4px',padding:'3px 10px',borderRadius:'8px',background:'rgba(99,102,241,.10)',border:'1px solid rgba(99,102,241,.18)'}}>
                  <span style={{fontSize:'12px',fontWeight:800,color:'rgba(99,102,241,.85)',fontVariantNumeric:'tabular-nums',letterSpacing:'.06em'}}>{timeStr}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            {[
              { rgb:'190,18,60',  bg:'linear-gradient(135deg,#E11D48,#9F1239)', val: Object.values(EMPS).filter(e => e.status === 'On Leave').length, sub:'On leave', textColor:'#BE123C',
                icon:<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="2.5" fill="white" opacity=".9"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".9"/></svg> },
              { rgb:'180,83,9',   bg:'linear-gradient(135deg,#D97706,#92400E)', val: 3, sub:'Alerts', textColor:'#B45309',
                icon:<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2l5.5 10H2.5L8 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity=".9"/><line x1="8" y1="7" x2="8" y2="9.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11.5" r=".8" fill="white"/></svg> },
              { rgb:'4,120,87',   bg:'linear-gradient(135deg,#059669,#047857)', val: Object.values(EMPS).length, sub:'Active', textColor:'#047857',
                icon:<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5" r="2" fill="white" opacity=".8"/><path d="M1 14c0-2.76 2.01-5 4.5-5" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity=".8"/><circle cx="11" cy="5" r="2.5" fill="white" opacity=".95"/><path d="M6.5 14c0-2.76 2.01-5 4.5-5s4.5 2.24 4.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".95"/></svg> },
            ].map(({ rgb, bg, val, sub, textColor, icon }) => (
              <div key={sub} style={{display:'flex',alignItems:'center',gap:'8px',padding:'7px 14px',borderRadius:'12px',background:`rgba(${rgb},.08)`,border:`1px solid rgba(${rgb},.18)`,transition:'transform .18s,box-shadow .18s',cursor:'default'}}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 20px rgba(${rgb},.16)`; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
              >
                <div style={{width:'28px',height:'28px',borderRadius:'8px',background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{icon}</div>
                <div>
                  <div style={{fontSize:'16px',fontWeight:800,color:textColor,lineHeight:1}}>{val}</div>
                  <div style={{fontSize:'9px',fontWeight:600,color:'rgba(80,100,140,.50)',textTransform:'uppercase',letterSpacing:'.05em'}}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        <StatCard label="Active Employees" val={ACTIVE_COUNT} color="cobalt" hint="across all departments" trend="↑ 3 from last month" trendUp pct="95%" pctLabel="capacity"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3.5" stroke="white" strokeWidth="1.8" fill="none" opacity=".95"/><path d="M2 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".95"/><circle cx="18" cy="8" r="2.5" stroke="white" strokeWidth="1.6" fill="none" opacity=".60"/><path d="M21.5 20c0-2.76-1.57-5.12-3.9-6.28" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".60"/></svg>}
        />
        <StatCard label="On Leave Today" val={ON_LEAVE_COUNT} color="rose" hint="5.6% of workforce" trend="↑ 2 from yesterday" trendUp pct="5.6%" pctLabel="of staff"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="3" stroke="white" strokeWidth="1.8" fill="none" opacity=".95"/><line x1="12" y1="4" x2="12" y2="5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".80"/><line x1="18" y1="10" x2="16.5" y2="10" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".80"/><line x1="6" y1="10" x2="7.5" y2="10" stroke="white" strokeWidth="1.6" strokeLinecap="round" opacity=".80"/><line x1="3" y1="17" x2="21" y2="17" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity=".70"/><path d="M4 20 Q6.5 18.5 9 20 Q11.5 21.5 14 20 Q16.5 18.5 19 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".90"/></svg>}
        />
        <StatCard label="On Leave This Week" val={23} color="amber" hint="Mon – Fri" trend="↓ 1 from last week" trendUp={false} pct="16%" pctLabel="this week"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="white" strokeWidth="1.8" fill="none" opacity=".95"/><path d="M3 10h18" stroke="white" strokeWidth="1.4" opacity=".50"/><line x1="8" y1="3" x2="8" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".90"/><line x1="16" y1="3" x2="16" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".90"/><circle cx="7" cy="14.5" r="1.2" fill="white" opacity=".90"/><circle cx="10" cy="14.5" r="1.2" fill="white" opacity=".90"/><circle cx="13" cy="14.5" r="1.2" fill="white" opacity=".90"/></svg>}
        />
        <StatCard label="On Leave This Month" val={41} color="teal" hint="July 2026" trend="↑ 5 from June" trendUp pct="29%" pctLabel="this month"
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="white" strokeWidth="1.8" fill="none" opacity=".95"/><path d="M3 10h18" stroke="white" strokeWidth="1.4" opacity=".50"/><line x1="8" y1="3" x2="8" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".90"/><line x1="16" y1="3" x2="16" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".90"/><rect x="6" y="13" width="3.5" height="3.5" rx="1" fill="white" opacity=".90"/><rect x="10.3" y="13" width="3.5" height="3.5" rx="1" fill="white" opacity=".70"/><rect x="14.6" y="13" width="3.5" height="3.5" rx="1" fill="white" opacity=".50"/></svg>}
        />
      </div>

      {/* Charts */}
      <div className="charts-row">
        {/* Donut */}
        <div className="card g" style={{display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
            <div className="chart-section-icon" style={{background:'linear-gradient(135deg,rgba(99,102,241,.15),rgba(99,102,241,.08))'}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="#6366f1" strokeWidth="1.5" fill="none" opacity=".5"/>
                <path d="M8 2 A6 6 0 0 1 14 8" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <circle cx="8" cy="8" r="2.5" fill="#6366f1" opacity=".25"/>
              </svg>
            </div>
            <div style={{flex:1}}>
              <div className="sec-lbl" style={{marginBottom:'1px'}}>Leave by Type</div>
              <div style={{fontSize:'10px',color:'rgba(80,100,140,.45)'}}>Current year — click legend to filter</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'18px',fontWeight:800,color:'rgba(20,24,50,.78)'}}>{DONUT_DATA.filter((_,i)=>!hiddenSegments.includes(i)).reduce((s,d)=>s+d.pct,0)}</div>
              <div style={{fontSize:'9px',color:'rgba(80,100,140,.45)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em'}}>days</div>
            </div>
          </div>

          {/* Interactive legend */}
          <div style={{display:'flex',flexWrap:'wrap',gap:'5px',marginBottom:'8px'}}>
            {DONUT_DATA.map((d, i) => {
              const hidden = hiddenSegments.includes(i);
              return (
                <button key={d.label} className="legend-pill" onClick={() => toggleSegment(i)}
                  style={{
                    background: hidden ? 'rgba(0,0,0,.04)' : `rgba(${d.rgb},.10)`,
                    border: `1px solid rgba(${d.rgb},${hidden ? '.12' : '.22'})`,
                    color: hidden ? 'rgba(80,100,140,.35)' : d.color,
                    textDecoration: hidden ? 'line-through' : 'none',
                    opacity: hidden ? .55 : 1,
                  }}>
                  <span style={{width:'7px',height:'7px',borderRadius:'50%',background:hidden?'#ccc':d.color,display:'inline-block',flexShrink:0}}/>
                  {d.label} {d.pct}%
                </button>
              );
            })}
          </div>

          <div className="chart-wrap" style={{height:'190px'}}><canvas ref={donutRef}></canvas></div>
        </div>

        {/* Bar chart */}
        <div className="card g" style={{display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
            <div className="chart-section-icon" style={{background:'linear-gradient(135deg,rgba(99,102,241,.15),rgba(99,102,241,.08))'}}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="8" width="3" height="7" rx="1.2" fill="#6366f1" opacity=".55"/>
                <rect x="5.5" y="5" width="3" height="10" rx="1.2" fill="#6366f1" opacity=".75"/>
                <rect x="10" y="2" width="3" height="13" rx="1.2" fill="#6366f1" opacity=".95"/>
              </svg>
            </div>
            <div style={{flex:1}}>
              <div className="sec-lbl" style={{marginBottom:'1px'}}>Monthly Leave Trend</div>
              <div style={{fontSize:'10px',color:'rgba(80,100,140,.45)'}}>Days taken per month — 2026</div>
            </div>
            {/* Period filter */}
            <div style={{display:'flex',gap:'3px',background:'rgba(99,102,241,.06)',borderRadius:'10px',padding:'3px'}}>
              {[['3m','3M'],['6m','6M'],['year','All']].map(([key, lbl]) => (
                <button key={key} className={`period-btn${period===key?' active':''}`}
                  onClick={() => setPeriod(key)}
                  style={{background:period===key?'rgba(99,102,241,.14)':'transparent',borderColor:period===key?'rgba(99,102,241,.22)':'transparent',color:period===key?'#4f46e5':'rgba(60,80,120,.55)'}}
                >{lbl}</button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div style={{display:'flex',gap:'10px',alignItems:'center',marginBottom:'8px'}}>
            {[['#2563EB','Below avg'],['#D97706','Above avg'],['#E11D48','High']].map(([c,l]) => (
              <div key={l} style={{display:'flex',alignItems:'center',gap:'5px'}}>
                <span style={{width:'10px',height:'10px',borderRadius:'3px',background:c,display:'inline-block',opacity:.75}}/>
                <span style={{fontSize:'10px',color:'rgba(80,100,140,.55)',fontWeight:600}}>{l}</span>
              </div>
            ))}
          </div>

          <div className="chart-wrap" style={{height:'220px'}}><canvas ref={trendRef}></canvas></div>
        </div>
      </div>
    </main>
  );
}
