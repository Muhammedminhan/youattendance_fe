import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { getCachedEmployees, empInitials, empColor } from '../api/employeeCache';
import { useTheme } from '../context/ThemeContext';

const SLOT = {
  A: { rgb:'37,99,235',  color:'#2563EB', light:'#1D4ED8', dark:'#93c5fd' },
  B: { rgb:'225,29,72',  color:'#E11D48', light:'#BE123C', dark:'#fda4af' },
};

const LEAVE_TYPES = [
  { key:'earned',       label:'Earned Leave',        color:'#2563EB', rgb:'37,99,235'   },
  { key:'sick',         label:'Sick Leave',           color:'#E11D48', rgb:'225,29,72'  },
  { key:'compensatory', label:'Compensatory Off',     color:'#059669', rgb:'5,150,105'  },
  { key:'restricted',   label:'Restricted Holiday',   color:'#D97706', rgb:'217,119,6'  },
  { key:'fop',          label:'FOP',                  color:'#7C3AED', rgb:'124,58,237' },
];

const MOCK_LEAVE = {
  EMP001: { earned:{taken:4,total:22},  sick:{taken:2,total:8}, compensatory:{taken:1,total:3}, restricted:{taken:1,total:2}, fop:{taken:0,total:1} },
  EMP002: { earned:{taken:7,total:22},  sick:{taken:5,total:8}, compensatory:{taken:2,total:4}, restricted:{taken:2,total:2}, fop:{taken:1,total:1} },
  EMP003: { earned:{taken:10,total:22}, sick:{taken:1,total:8}, compensatory:{taken:0,total:2}, restricted:{taken:0,total:2}, fop:{taken:0,total:1} },
  EMP004: { earned:{taken:2,total:15},  sick:{taken:3,total:8}, compensatory:{taken:0,total:1}, restricted:{taken:1,total:2}, fop:{taken:0,total:1} },
  EMP005: { earned:{taken:6,total:22},  sick:{taken:4,total:8}, compensatory:{taken:3,total:5}, restricted:{taken:1,total:2}, fop:{taken:1,total:1} },
  EMP006: { earned:{taken:8,total:22},  sick:{taken:2,total:8}, compensatory:{taken:1,total:3}, restricted:{taken:2,total:2}, fop:{taken:0,total:1} },
  EMP007: { earned:{taken:12,total:22}, sick:{taken:6,total:8}, compensatory:{taken:2,total:3}, restricted:{taken:2,total:2}, fop:{taken:1,total:1} },
  EMP008: { earned:{taken:5,total:22},  sick:{taken:3,total:8}, compensatory:{taken:0,total:2}, restricted:{taken:0,total:2}, fop:{taken:0,total:1} },
  EMP009: { earned:{taken:9,total:22},  sick:{taken:1,total:8}, compensatory:{taken:4,total:6}, restricted:{taken:1,total:2}, fop:{taken:0,total:1} },
  EMP010: { earned:{taken:3,total:15},  sick:{taken:4,total:8}, compensatory:{taken:0,total:1}, restricted:{taken:2,total:2}, fop:{taken:0,total:1} },
  EMP011: { earned:{taken:11,total:22}, sick:{taken:5,total:8}, compensatory:{taken:2,total:4}, restricted:{taken:1,total:2}, fop:{taken:1,total:1} },
  EMP012: { earned:{taken:22,total:22}, sick:{taken:8,total:8}, compensatory:{taken:3,total:3}, restricted:{taken:2,total:2}, fop:{taken:1,total:1} },
};

function getLeave(empId) {
  return MOCK_LEAVE[empId] || { earned:{taken:5,total:22}, sick:{taken:2,total:8}, compensatory:{taken:1,total:3}, restricted:{taken:1,total:2}, fop:{taken:0,total:1} };
}

const STATUS_META = {
  Active:          { rgb:'5,150,105',  lc:'#047857', dc:'#6ee7b7' },
  Probation:       { rgb:'217,119,6',  lc:'#B45309', dc:'#fcd34d' },
  Terminated:      { rgb:'225,29,72',  lc:'#BE123C', dc:'#fda4af' },
  Resigned:        { rgb:'225,29,72',  lc:'#BE123C', dc:'#fda4af' },
  'Notice period': { rgb:'217,119,6',  lc:'#B45309', dc:'#fcd34d' },
};

function StatusPill({ status, isLight }) {
  const m = STATUS_META[status] || { rgb:'100,116,139', lc:'#475569', dc:'rgba(150,168,210,.60)' };
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700,
      background:`rgba(${m.rgb},${isLight?'.08':'.14'})`,border:`1px solid rgba(${m.rgb},${isLight?'.16':'.26'})`,
      color:isLight?m.lc:m.dc}}>
      <span style={{width:'5px',height:'5px',borderRadius:'50%',background:`rgb(${m.rgb})`,display:'inline-block'}}/>
      {status || 'Active'}
    </span>
  );
}

function FieldRow({ label, va, vb, isLight }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 160px 1fr',alignItems:'center',
      borderBottom:`1px solid ${isLight?'rgba(0,0,0,.05)':'rgba(255,255,255,.06)'}`}}>
      <div style={{padding:'12px 20px',fontSize:'13px',fontWeight:700,textAlign:'right',
        color:isLight?'rgba(30,41,59,.72)':'rgba(200,215,255,.75)'}}>
        {va || '—'}
      </div>
      <div style={{fontSize:'10px',fontWeight:700,color:isLight?'rgba(71,85,105,.50)':'rgba(160,180,220,.42)',
        textTransform:'uppercase',letterSpacing:'.07em',textAlign:'center',padding:'12px 6px',
        background:isLight?'rgba(0,0,0,.025)':'rgba(0,0,0,.12)'}}>
        {label}
      </div>
      <div style={{padding:'12px 20px',fontSize:'13px',fontWeight:700,
        color:isLight?'rgba(30,41,59,.72)':'rgba(200,215,255,.75)'}}>
        {vb || '—'}
      </div>
    </div>
  );
}

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allEmps, setAllEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [emp1Id, setEmp1Id] = useState(searchParams.get('emp1') || '');
  const [emp2Id, setEmp2Id] = useState(searchParams.get('emp2') || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [changingSlot, setChangingSlot] = useState(null);
  const { isLight } = useTheme();

  useEffect(() => {
    getCachedEmployees()
      .then(list => {
        setAllEmps(list);
        // Auto-pick defaults if URL params don't match real employees
        const ids = list.map(e => e.employee_id);
        if (!ids.includes(emp1Id)) setEmp1Id(ids[0] || '');
        if (!ids.includes(emp2Id)) setEmp2Id(ids[1] || ids[0] || '');
        setLoading(false);
      })
      .catch(() => { setFetchError(true); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (emp1Id || emp2Id) setSearchParams({ emp1: emp1Id, emp2: emp2Id }, { replace: true });
  }, [emp1Id, emp2Id, setSearchParams]);

  const a = allEmps.find(e => e.employee_id === emp1Id) || allEmps[0];
  const b = allEmps.find(e => e.employee_id === emp2Id) || allEmps[1];

  if (loading) return (
    <main className="main" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',
      gap:'10px',color:'rgba(100,116,139,.55)',fontSize:'13px',fontFamily:'Inter,sans-serif'}}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{animation:'spin .7s linear infinite'}}>
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" opacity=".25" fill="none"/>
        <path d="M9 2a7 7 0 017 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
      Loading employees…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );

  if (fetchError) return (
    <main className="main" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',
      flexDirection:'column',gap:'14px',fontFamily:'Inter,sans-serif'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'16px 24px',borderRadius:'14px',
        background:'rgba(225,29,72,.06)',border:'1px solid rgba(225,29,72,.20)',
        color:'#BE123C',fontSize:'13px',fontWeight:600}}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" fill="none"/>
          <line x1="8" y1="5" x2="8" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <circle cx="8" cy="11.5" r=".8" fill="currentColor"/>
        </svg>
        Failed to load employees. Check your connection and try again.
      </div>
      <BackButton to="/employees" label="Back to Employees" />
    </main>
  );

  if (!a || !b) return (
    <main className="main" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',
      flexDirection:'column',gap:'12px',color:'rgba(100,116,139,.55)',fontSize:'13px',fontFamily:'Inter,sans-serif'}}>
      <div>No employees available to compare.</div>
      <BackButton to="/employees" label="Back to Employees" />
    </main>
  );

  return (
    <main className="main">
      <style>{`
        .emp-selector-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
        .emp-sel-card{border-radius:18px;padding:20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
        .sel-avatar{width:54px;height:54px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;flex-shrink:0}
        .change-btn{margin-left:auto;padding:6px 14px;border-radius:10px;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .15s}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:500;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
        .modal-opt{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;cursor:pointer;transition:background .14s}
        @media(max-width:700px){.emp-selector-row{grid-template-columns:1fr}}
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
            <div className="page-sub">Side-by-side employee comparison</div>
          </div>
        </div>
        <BackButton to="/employees" label="Back to Employees" />
      </div>

      {/* Employee selector cards */}
      <div className="emp-selector-row">
        {[{ emp: a, slot: 'A' }, { emp: b, slot: 'B' }].map(({ emp, slot }) => {
          const s = SLOT[slot];
          const name = emp.employee_name || '';
          const eid  = emp.employee_id  || '';
          return (
            <div key={slot} className="emp-sel-card g" style={{borderTop:`3px solid rgba(${s.rgb},.55)`}}>
              <div className="sel-avatar" style={{
                background: empColor(eid),
                boxShadow: `0 0 0 3px rgba(${s.rgb},.35), 0 4px 14px rgba(0,0,0,.20)`,
              }}>
                {empInitials(name)}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'2px'}}>
                  <div style={{fontSize:'14px',fontWeight:700,color:isLight?'rgba(15,23,42,.88)':'rgba(220,230,255,.90)'}}>{name}</div>
                  <div style={{fontSize:'10px',fontWeight:800,padding:'1px 7px',borderRadius:'20px',background:`rgba(${s.rgb},.12)`,border:`1px solid rgba(${s.rgb},.22)`,color:isLight?s.light:s.dark,letterSpacing:'.04em'}}>
                    {slot}
                  </div>
                </div>
                <div style={{fontSize:'11px',color:isLight?'rgba(71,85,105,.50)':'rgba(160,180,230,.42)',marginBottom:'5px'}}>
                  {eid}{emp.email ? ` · ${emp.email}` : ''}
                </div>
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
        <div style={{display:'grid',gridTemplateColumns:'1fr 160px 1fr',background:isLight?'rgba(0,0,0,.03)':'rgba(0,0,0,.18)',borderBottom:`1px solid ${isLight?'rgba(0,0,0,.06)':'rgba(255,255,255,.08)'}`}}>
          <div style={{padding:'12px 20px',textAlign:'right',fontSize:'12px',fontWeight:800,color:isLight?SLOT.A.light:SLOT.A.dark}}>
            {a.employee_name}
          </div>
          <div style={{padding:'12px 8px',textAlign:'center',fontSize:'10px',fontWeight:700,color:isLight?'rgba(71,85,105,.50)':'rgba(160,180,220,.42)',textTransform:'uppercase',letterSpacing:'.08em'}}>
            Field
          </div>
          <div style={{padding:'12px 20px',textAlign:'left',fontSize:'12px',fontWeight:800,color:isLight?SLOT.B.light:SLOT.B.dark}}>
            {b.employee_name}
          </div>
        </div>
        <FieldRow label="Employee ID"  va={a.employee_id}    vb={b.employee_id}    isLight={isLight}/>
        <FieldRow label="Email"        va={a.email}          vb={b.email}          isLight={isLight}/>
        <FieldRow label="Shift Start"  va={a.shift_start_time} vb={b.shift_start_time} isLight={isLight}/>
        <FieldRow label="Shift End"    va={a.shift_end_time}   vb={b.shift_end_time}   isLight={isLight}/>
        {/* Status row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 160px 1fr',alignItems:'center'}}>
          <div style={{padding:'12px 20px',display:'flex',justifyContent:'flex-end'}}>
            <StatusPill status={a.status} isLight={isLight}/>
          </div>
          <div style={{fontSize:'10px',fontWeight:700,color:isLight?'rgba(71,85,105,.50)':'rgba(160,180,220,.42)',textTransform:'uppercase',letterSpacing:'.07em',textAlign:'center',padding:'12px 6px',background:isLight?'rgba(0,0,0,.025)':'rgba(0,0,0,.12)'}}>
            Status
          </div>
          <div style={{padding:'12px 20px',display:'flex',justifyContent:'flex-start'}}>
            <StatusPill status={b.status} isLight={isLight}/>
          </div>
        </div>
      </div>

      {/* Leave balance comparison */}
      {(() => {
        const leaveA = getLeave(a.employee_id);
        const leaveB = getLeave(b.employee_id);
        const totalTakenA = LEAVE_TYPES.reduce((s, lt) => s + (leaveA[lt.key]?.taken || 0), 0);
        const totalTakenB = LEAVE_TYPES.reduce((s, lt) => s + (leaveB[lt.key]?.taken || 0), 0);
        const divider = `1px solid ${isLight?'rgba(0,0,0,.05)':'rgba(255,255,255,.06)'}`;
        const midBg   = isLight?'rgba(0,0,0,.025)':'rgba(0,0,0,.12)';
        const midClr  = isLight?'rgba(71,85,105,.50)':'rgba(160,180,220,.42)';
        return (
          <div className="g" style={{borderRadius:'18px',overflow:'hidden',padding:0}}>
            {/* Section header */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 160px 1fr',background:isLight?'rgba(0,0,0,.03)':'rgba(0,0,0,.18)',borderBottom:divider}}>
              <div style={{padding:'12px 20px',textAlign:'right',fontSize:'12px',fontWeight:800,color:isLight?SLOT.A.light:SLOT.A.dark}}>
                {a.employee_name}
              </div>
              <div style={{padding:'12px 8px',textAlign:'center',fontSize:'10px',fontWeight:700,color:midClr,textTransform:'uppercase',letterSpacing:'.08em',background:midBg}}>
                Leave Balance
              </div>
              <div style={{padding:'12px 20px',textAlign:'left',fontSize:'12px',fontWeight:800,color:isLight?SLOT.B.light:SLOT.B.dark}}>
                {b.employee_name}
              </div>
            </div>

            {/* Total taken summary */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 160px 1fr',borderBottom:divider,background:isLight?'rgba(37,99,235,.03)':'rgba(37,99,235,.06)'}}>
              <div style={{padding:'16px 20px',textAlign:'right'}}>
                <div style={{fontSize:'26px',fontWeight:900,letterSpacing:'-.03em',color:isLight?SLOT.A.light:SLOT.A.dark}}>{totalTakenA}</div>
                <div style={{fontSize:'11px',fontWeight:600,color:isLight?'rgba(60,80,120,.52)':'rgba(160,185,230,.48)',marginTop:'2px'}}>days taken this year</div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700,color:midClr,textTransform:'uppercase',letterSpacing:'.07em',background:midBg,padding:'0 6px',textAlign:'center'}}>
                Total Taken
              </div>
              <div style={{padding:'16px 20px'}}>
                <div style={{fontSize:'26px',fontWeight:900,letterSpacing:'-.03em',color:isLight?SLOT.B.light:SLOT.B.dark}}>{totalTakenB}</div>
                <div style={{fontSize:'11px',fontWeight:600,color:isLight?'rgba(60,80,120,.52)':'rgba(160,185,230,.48)',marginTop:'2px'}}>days taken this year</div>
              </div>
            </div>

            {/* Per leave-type rows */}
            {LEAVE_TYPES.map((lt, i) => {
              const da = leaveA[lt.key] || { taken:0, total:0 };
              const db = leaveB[lt.key] || { taken:0, total:0 };
              const balA = da.total - da.taken;
              const balB = db.total - db.taken;
              const pctA = da.total > 0 ? (da.taken / da.total) * 100 : 0;
              const pctB = db.total > 0 ? (db.taken / db.total) * 100 : 0;
              const isLast = i === LEAVE_TYPES.length - 1;
              return (
                <div key={lt.key} style={{display:'grid',gridTemplateColumns:'1fr 160px 1fr',borderBottom:isLast?'none':divider}}>
                  {/* Employee A */}
                  <div style={{padding:'14px 20px',textAlign:'right'}}>
                    <div style={{display:'flex',alignItems:'baseline',gap:'5px',justifyContent:'flex-end'}}>
                      <span style={{fontSize:'18px',fontWeight:800,letterSpacing:'-.02em',color:isLight?'rgba(15,23,42,.88)':'rgba(220,230,255,.90)'}}>{balA}</span>
                      <span style={{fontSize:'11px',fontWeight:600,color:isLight?'rgba(71,85,105,.50)':'rgba(160,185,230,.45)'}}>left</span>
                    </div>
                    <div style={{fontSize:'11px',color:isLight?'rgba(71,85,105,.45)':'rgba(160,185,230,.40)',marginTop:'2px'}}>
                      {da.taken} taken / {da.total} total
                    </div>
                    <div style={{height:'4px',borderRadius:'2px',background:`rgba(${lt.rgb},.12)`,marginTop:'7px',overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pctA}%`,background:lt.color,borderRadius:'2px',marginLeft:'auto',transition:'width .5s ease'}}/>
                    </div>
                  </div>
                  {/* Center label */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'center',background:midBg,padding:'0 8px'}}>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'5px'}}>
                      <div style={{width:'8px',height:'8px',borderRadius:'50%',background:lt.color,flexShrink:0}}/>
                      <div style={{fontSize:'10px',fontWeight:700,color:midClr,textTransform:'uppercase',letterSpacing:'.05em',textAlign:'center',lineHeight:1.3}}>
                        {lt.label}
                      </div>
                    </div>
                  </div>
                  {/* Employee B */}
                  <div style={{padding:'14px 20px'}}>
                    <div style={{display:'flex',alignItems:'baseline',gap:'5px'}}>
                      <span style={{fontSize:'18px',fontWeight:800,letterSpacing:'-.02em',color:isLight?'rgba(15,23,42,.88)':'rgba(220,230,255,.90)'}}>{balB}</span>
                      <span style={{fontSize:'11px',fontWeight:600,color:isLight?'rgba(71,85,105,.50)':'rgba(160,185,230,.45)'}}>left</span>
                    </div>
                    <div style={{fontSize:'11px',color:isLight?'rgba(71,85,105,.45)':'rgba(160,185,230,.40)',marginTop:'2px'}}>
                      {db.taken} taken / {db.total} total
                    </div>
                    <div style={{height:'4px',borderRadius:'2px',background:`rgba(${lt.rgb},.12)`,marginTop:'7px',overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pctB}%`,background:lt.color,borderRadius:'2px',transition:'width .5s ease'}}/>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Change employee modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div style={{width:'340px',maxHeight:'80vh',overflowY:'auto',borderRadius:'20px',padding:'24px',
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
            {allEmps
              .filter(e => e.employee_id !== (changingSlot === 'A' ? emp2Id : emp1Id))
              .map(e => {
                const s = SLOT[changingSlot] || SLOT.A;
                return (
                  <div key={e.employee_id} className="modal-opt"
                    onMouseEnter={el => el.currentTarget.style.background = isLight?'rgba(37,99,235,.06)':'rgba(255,255,255,.06)'}
                    onMouseLeave={el => el.currentTarget.style.background = 'transparent'}
                    onClick={() => {
                      if (changingSlot === 'A') setEmp1Id(e.employee_id);
                      else setEmp2Id(e.employee_id);
                      setModalOpen(false);
                    }}>
                    <div style={{width:'34px',height:'34px',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'13px',fontWeight:800,color:'#fff',flexShrink:0,background:empColor(e.employee_id),boxShadow:'0 3px 10px rgba(0,0,0,.20)'}}>
                      {empInitials(e.employee_name)}
                    </div>
                    <div>
                      <div style={{fontSize:'13px',fontWeight:700,color:isLight?'rgba(20,30,70,.85)':'rgba(200,215,255,.88)'}}>{e.employee_name}</div>
                      <div style={{fontSize:'11px',color:isLight?'rgba(71,85,105,.50)':'rgba(160,180,220,.45)',marginTop:'1px'}}>{e.employee_id}</div>
                    </div>
                  </div>
                );
              })}
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
