import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getEmployee, getCachedEmployees, empInitials, empColor } from '../api/employeeCache';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLight } = useTheme();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [allEmps, setAllEmps] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getEmployee(id)
      .then(data => {
        if (!cancelled) { setEmp(data); setLoading(false); }
      })
      .catch(err => {
        if (!cancelled) {
          if (err?.response?.status === 404) setNotFound(true);
          setLoading(false);
        }
      });
    getCachedEmployees()
      .then(list => {
        if (!cancelled) {
          setAllEmps(list);
          const other = list.find(e => e.employee_id !== id);
          if (other) setCompareTarget(other.employee_id);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return (
    <main className="main" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',
      gap:'10px',color:'rgba(100,116,139,.55)',fontSize:'13px',fontFamily:'Inter,sans-serif'}}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{animation:'spin .7s linear infinite'}}>
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" opacity=".25" fill="none"/>
        <path d="M9 2a7 7 0 017 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
      Loading employee…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
  if (notFound || !emp) return <Navigate to="/employees" replace />;

  const empName = emp.employee_name || '';
  const empId   = emp.employee_id  || '';
  const color   = empColor(empId);
  const initials = empInitials(empName);

  const STATUS_META = {
    Active:          { rgb:'5,150,105',  light:'#047857', dark:'#6ee7b7', label:'Active'        },
    Probation:       { rgb:'217,119,6',  light:'#B45309', dark:'#fcd34d', label:'Probation'     },
    Terminated:      { rgb:'225,29,72',  light:'#BE123C', dark:'#fda4af', label:'Terminated'    },
    Resigned:        { rgb:'225,29,72',  light:'#BE123C', dark:'#fda4af', label:'Resigned'      },
    'Notice period': { rgb:'217,119,6',  light:'#B45309', dark:'#fcd34d', label:'Notice period' },
  };
  const sm = STATUS_META[emp.status] || STATUS_META.Active;

  const shiftMeta = (emp.shift_start_time && emp.shift_end_time)
    ? `${emp.shift_start_time} – ${emp.shift_end_time}`
    : emp.email || '';

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

        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .detail-card{border-radius:18px;padding:22px}

        .cmp-select{width:100%;padding:10px 14px;border-radius:12px;font-size:13px;font-family:inherit;outline:none;margin:14px 0}
        .cmp-btn{padding:11px 28px;border-radius:13px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;border:none;background:linear-gradient(135deg,#2563EB,#1E40AF);color:#fff;box-shadow:0 4px 14px rgba(37,99,235,.35);transition:box-shadow .18s,transform .18s}
        .cmp-btn:hover{box-shadow:0 6px 20px rgba(37,99,235,.45);transform:translateY(-1px)}

        .rpt-overlay{display:none;position:fixed;inset:0;z-index:600;background:rgba(1,4,9,.80);backdrop-filter:blur(6px);align-items:flex-start;justify-content:center;padding:24px 16px;overflow-y:auto}
        .rpt-overlay.open{display:flex}
        #rpt-box{background:#fff;color:#111;border-radius:20px;width:720px;max-width:100%;box-shadow:0 32px 80px rgba(0,0,0,.70);overflow:hidden;font-family:'Inter',sans-serif}
        .rpt-toolbar{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:14px 20px;display:flex;align-items:center;justify-content:space-between}
        .rpt-toolbar-title{font-size:13px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.06em}
        .rpt-close-btn{padding:7px 14px;border-radius:8px;background:#f1f5f9;border:1px solid #e2e8f0;font-size:12px;font-weight:700;color:#475569;cursor:pointer;font-family:inherit}
        .rpt-body{padding:36px 40px}
        @media(max-width:780px){.two-col{grid-template-columns:1fr}}
      `}</style>

      <BackButton to="/employees" label="Back to Employees" />

      {/* Hero */}
      <div className="hero g" style={{background:color}}>
        <div style={{display:'flex',alignItems:'center',gap:'20px',flexWrap:'wrap'}}>
          <div className="hero-av">{initials}</div>
          <div>
            <div className="hero-name">{empName}</div>
            <div className="hero-meta">{empId}{shiftMeta ? ` · ${shiftMeta}` : ''}</div>
            <div className="hero-badges">
              <span style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'3px 11px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:'rgba(0,0,0,.22)',border:'1px solid rgba(255,255,255,.25)',color:'#fff'}}>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'rgba(255,255,255,.80)',display:'inline-block'}}/>
                {emp.status || 'Active'}
              </span>
              {emp.email && (
                <span style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'3px 11px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:'rgba(255,255,255,.18)',border:'1px solid rgba(255,255,255,.28)',color:'rgba(255,255,255,.92)'}}>
                  {emp.email}
                </span>
              )}
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

      {/* Info cards */}
      <div className="two-col" style={{marginBottom:'16px'}}>
        {/* Employee details */}
        <div className="detail-card g">
          <div className="sec-lbl" style={{marginBottom:'18px'}}>Employee Details</div>
          {[
            ['Employee ID', empId],
            ['Name',        empName],
            ['Email',       emp.email || '—'],
            ['Status',      emp.status || '—'],
            ['Shift Start', emp.shift_start_time || '—'],
            ['Shift End',   emp.shift_end_time   || '—'],
          ].map(([label, val]) => (
            <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'9px 0',borderBottom:isLight?'1px solid rgba(200,210,240,.35)':'1px solid rgba(255,255,255,.07)'}}>
              <span style={{fontSize:'12px',fontWeight:600,color:isLight?'rgba(60,80,120,.55)':'rgba(160,180,230,.52)'}}>{label}</span>
              <span style={{fontSize:'13px',fontWeight:700,color:isLight?'rgba(15,23,42,.85)':'rgba(220,230,255,.90)'}}>{val}</span>
            </div>
          ))}
        </div>

        {/* Leave data placeholder */}
        <div className="detail-card g" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',gap:'12px'}}>
          <div style={{width:'48px',height:'48px',borderRadius:'14px',background:isLight?'rgba(37,99,235,.08)':'rgba(37,99,235,.12)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="5" width="18" height="15" rx="3" stroke={isLight?'#2563EB':'#93c5fd'} strokeWidth="1.5" fill="none"/>
              <path d="M2 10h18" stroke={isLight?'#2563EB':'#93c5fd'} strokeWidth="1.2" opacity=".5"/>
              <line x1="7" y1="3" x2="7" y2="7" stroke={isLight?'#2563EB':'#93c5fd'} strokeWidth="2" strokeLinecap="round"/>
              <line x1="15" y1="3" x2="15" y2="7" stroke={isLight?'#2563EB':'#93c5fd'} strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:'14px',fontWeight:700,color:isLight?'rgba(15,23,42,.75)':'rgba(220,230,255,.80)',marginBottom:'5px'}}>Leave Data Coming Soon</div>
            <div style={{fontSize:'12px',color:isLight?'rgba(60,80,120,.48)':'rgba(160,180,230,.45)',lineHeight:1.6,maxWidth:'240px'}}>
              Leave balances, history, and trend data will appear here once leave tracking is configured.
            </div>
          </div>
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
          Select a colleague to view a side-by-side comparison.
        </p>
        <select className="cmp-select" value={compareTarget} onChange={e => setCompareTarget(e.target.value)} style={{
          background: isLight?'rgba(255,255,255,.65)':'rgba(255,255,255,.07)',
          border: isLight?'1px solid rgba(200,210,240,.65)':'1px solid rgba(255,255,255,.14)',
          color: isLight?'rgba(15,23,42,.85)':'rgba(220,230,255,.90)',
        }}>
          {allEmps.filter(e => e.employee_id !== empId).map(e => (
            <option key={e.employee_id} value={e.employee_id}>
              {e.employee_name} ({e.employee_id})
            </option>
          ))}
        </select>
        <button
          className="cmp-btn"
          disabled={!compareTarget}
          onClick={() => navigate(`/compare?emp1=${empId}&emp2=${compareTarget}`)}
        >
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
              <div style={{display:'flex',alignItems:'center',gap:'20px',marginBottom:'28px',paddingBottom:'24px',borderBottom:'2px solid #f1f5f9'}}>
                <div style={{width:'68px',height:'68px',borderRadius:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',fontWeight:800,color:'#fff',flexShrink:0,background:color,boxShadow:'0 4px 16px rgba(0,0,0,.15)'}}>
                  {initials}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'22px',fontWeight:800,color:'#0f172a',letterSpacing:'-.02em'}}>{empName}</div>
                  <div style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}>{empId}{emp.email ? ` · ${emp.email}` : ''}</div>
                  {shiftMeta && <div style={{fontSize:'12px',color:'#94a3b8',marginTop:'2px'}}>Shift: {shiftMeta}</div>}
                  <span style={{display:'inline-flex',alignItems:'center',gap:'5px',marginTop:'8px',padding:'3px 11px',borderRadius:'20px',fontSize:'11px',fontWeight:700,
                    background: emp.status === 'Active' ? '#dcfce7' : emp.status === 'Probation' ? '#fef3c7' : '#fee2e2',
                    color:       emp.status === 'Active' ? '#047857' : emp.status === 'Probation' ? '#B45309'  : '#BE123C',
                  }}>
                    {emp.status || 'Active'}
                  </span>
                </div>
              </div>
              <div style={{textAlign:'center',padding:'24px',background:'#f8fafc',borderRadius:'12px',border:'1px solid #e2e8f0'}}>
                <div style={{fontSize:'13px',color:'#64748b',fontWeight:500}}>
                  Leave data not yet available. Full report will be available once leave tracking is configured.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
