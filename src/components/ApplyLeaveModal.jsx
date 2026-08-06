import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const TYPE_META = {
  'Annual Leave': { color:'#2563EB', rgb:'37,99,235',  label:'Annual',  icon:
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M1.5 6h11" stroke="currentColor" strokeWidth="1" opacity=".5"/><line x1="4.5" y1="1" x2="4.5" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="9.5" y1="1" x2="9.5" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  'Sick Leave':   { color:'#E11D48', rgb:'225,29,72',  label:'Sick',    icon:
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none"/><line x1="7" y1="4.5" x2="7" y2="9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  'Emergency':    { color:'#D97706', rgb:'217,119,6',  label:'Emergency', icon:
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L12.5 11.5H1.5L7 1.5z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"/><line x1="7" y1="5.5" x2="7" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="7" cy="10" r=".7" fill="currentColor"/></svg> },
  'WFH':          { color:'#059669', rgb:'5,150,105',  label:'WFH',     icon:
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L7 2l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="7" width="6" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" fill="none"/><rect x="5.5" y="9" width="3" height="3.5" rx=".5" stroke="currentColor" strokeWidth="1" fill="none"/></svg> },
  'Unpaid':       { color:'#7C3AED', rgb:'124,58,237', label:'Unpaid',  icon:
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" fill="none"/><path d="M7 4v6M5 5.5h2.5a1.5 1.5 0 010 3H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
};

const DEFAULT_BALANCE = { 'Annual Leave':20, 'Sick Leave':10, 'Emergency':5, 'WFH':10, 'Unpaid':5 };
const DEFAULT_USED    = { 'Annual Leave':0,  'Sick Leave':0,  'Emergency':0, 'WFH':0,  'Unpaid':0  };

function calcWorkingDays(from, to) {
  if (!from || !to) return 0;
  const start = new Date(from), end = new Date(to);
  if (start > end) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export default function ApplyLeaveModal({ onClose, employee }) {
  const { isLight } = useTheme();
  const [type, setType]         = useState('Annual Leave');
  const [startDate, setStart]   = useState('');
  const [endDate, setEnd]       = useState('');
  const [halfDay, setHalfDay]   = useState(false);
  const [reason, setReason]     = useState('');
  const [errors, setErrors]     = useState({});
  const [submitting, setSub]    = useState(false);
  const [success, setSuccess]   = useState(false);

  const meta = TYPE_META[type];

  /* Balance for selected type */
  const balEntry = employee?.balance?.find(b => b.name === type);
  const maxDays  = balEntry ? balEntry.max  : DEFAULT_BALANCE[type];
  const usedDays = balEntry ? balEntry.used : DEFAULT_USED[type];
  const remaining = maxDays - usedDays;
  const usedPct   = Math.round((usedDays / maxDays) * 100);

  /* Working days calc */
  const workingDays = halfDay ? 0.5 : calcWorkingDays(startDate, endDate);
  const newUsed     = usedDays + workingDays;
  const newPct      = Math.min(Math.round((newUsed / maxDays) * 100), 100);
  const insufficient = workingDays > remaining;

  /* ---- validation ---- */
  function validate() {
    const e = {};
    if (!startDate) e.start = 'Start date required';
    if (!halfDay && !endDate) e.end = 'End date required';
    if (startDate && endDate && !halfDay && new Date(startDate) > new Date(endDate))
      e.end = 'End date must be on or after start';
    if (workingDays === 0 && !halfDay && startDate && endDate)
      e.start = 'No working days in selected range';
    if (insufficient) e.balance = `Only ${remaining} day${remaining !== 1 ? 's' : ''} remaining`;
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSub(true);
    setTimeout(() => { setSub(false); setSuccess(true); }, 900);
    setTimeout(() => onClose(), 2600);
  }

  /* ---- theme tokens ---- */
  const surface  = isLight ? '#ffffff'              : '#161b22';
  const border   = isLight ? '#e2e8f0'              : '#30363d';
  const textPri  = isLight ? 'rgba(15,23,42,.90)'   : '#e6edf3';
  const textSub  = isLight ? 'rgba(60,80,120,.55)'  : '#8b949e';
  const inputBg  = isLight ? '#f8fafc'              : '#0d1117';
  const inputClr = isLight ? 'rgba(15,23,42,.88)'   : '#c9d1d9';

  /* ---- success screen ---- */
  if (success) return (
    <div style={{display:'flex',position:'fixed',inset:0,zIndex:600,alignItems:'center',justifyContent:'center',background:'rgba(1,4,9,.70)',backdropFilter:'blur(4px)'}}
      onClick={onClose}>
      <div style={{background:surface,border:`1px solid ${border}`,borderRadius:'24px',
        padding:'44px 40px',textAlign:'center',
        boxShadow:isLight?'0 24px 64px rgba(0,0,0,.12)':'0 24px 64px rgba(0,0,0,.60)',
        animation:'successPop .4s cubic-bezier(.34,1.6,.64,1)'}}>
        <style>{`@keyframes successPop{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{width:'72px',height:'72px',borderRadius:'24px',
          background:'linear-gradient(135deg,#059669,#047857)',
          display:'flex',alignItems:'center',justifyContent:'center',
          margin:'0 auto 20px',boxShadow:'0 8px 28px rgba(5,150,105,.38)'}}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M7 17l6 6 12-14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{fontSize:'18px',fontWeight:800,color:textPri,marginBottom:'8px'}}>Request Submitted!</div>
        <div style={{fontSize:'13px',color:textSub,lineHeight:1.6,maxWidth:'260px',margin:'0 auto'}}>
          Your <strong style={{color:meta.color}}>{type}</strong> request for{' '}
          <strong style={{color:textPri}}>{workingDays} day{workingDays !== 1?'s':''}</strong> has been sent for approval.
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{display:'flex',position:'fixed',inset:0,zIndex:600,alignItems:'center',justifyContent:'center',
        background:'rgba(1,4,9,.70)',backdropFilter:'blur(4px)'}}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background:surface,border:`1px solid ${border}`,borderRadius:'22px',
        width:'460px',maxWidth:'96vw',maxHeight:'92vh',overflowY:'auto',
        padding:'28px',position:'relative',
        boxShadow:isLight?'0 24px 64px rgba(0,0,0,.12)':'0 24px 64px rgba(0,0,0,.60)',
        animation:'slideUp .22s cubic-bezier(.34,1.2,.64,1)',
      }}>
        <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Close */}
        <button onClick={onClose}
          style={{position:'absolute',top:'14px',right:'14px',background:'none',border:'none',
            color:textSub,cursor:'pointer',borderRadius:'8px',width:'28px',height:'28px',
            display:'flex',alignItems:'center',justifyContent:'center'}}
          onMouseEnter={e=>e.currentTarget.style.background=isLight?'rgba(15,23,42,.07)':'rgba(255,255,255,.07)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
          <div style={{width:'38px',height:'38px',borderRadius:'12px',flexShrink:0,
            background:'linear-gradient(135deg,#2563EB,#1E40AF)',
            display:'flex',alignItems:'center',justifyContent:'center',
            boxShadow:'0 4px 16px rgba(37,99,235,.30)'}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="3" width="14" height="13" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M2 7.5h14" stroke="white" strokeWidth="1.2" opacity=".5"/>
              <line x1="6" y1="1.5" x2="6" y2="4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="12" y1="1.5" x2="12" y2="4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M5.5 12l2 2 4-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{fontSize:'15px',fontWeight:800,color:textPri,letterSpacing:'-.02em'}}>Apply for Leave</div>
            {employee && <div style={{fontSize:'11px',color:textSub,marginTop:'1px'}}>for {employee.name}</div>}
          </div>
        </div>

        {/* Leave Type Selector */}
        <div style={{marginBottom:'18px'}}>
          <label style={{fontSize:'11px',fontWeight:700,color:textSub,textTransform:'uppercase',
            letterSpacing:'.06em',display:'block',marginBottom:'8px'}}>Leave Type</label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'7px'}}>
            {Object.entries(TYPE_META).map(([key, m]) => {
              const sel = type === key;
              return (
                <button key={key} onClick={() => { setType(key); setErrors({}); }}
                  style={{padding:'9px 6px',borderRadius:'10px',border:`1.5px solid ${sel?`rgba(${m.rgb},.50)`:border}`,
                    background:sel?`rgba(${m.rgb},.10)`:inputBg,
                    color:sel?m.color:textSub,
                    fontSize:'11px',fontWeight:700,fontFamily:'inherit',cursor:'pointer',
                    display:'flex',flexDirection:'column',alignItems:'center',gap:'5px',
                    transition:'all .14s',
                    boxShadow:sel?`0 2px 10px rgba(${m.rgb},.16)`:'none',
                  }}>
                  <span style={{color:sel?m.color:textSub,display:'flex'}}>{m.icon}</span>
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Balance bar */}
        <div style={{marginBottom:'18px',padding:'12px 14px',borderRadius:'12px',
          background:isLight?`rgba(${meta.rgb},.05)`:`rgba(${meta.rgb},.08)`,
          border:`1px solid rgba(${meta.rgb},${isLight?'.12':'.18'})`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
            <span style={{fontSize:'11px',fontWeight:700,color:isLight?meta.color:'rgba(200,215,255,.75)'}}>
              {type} Balance
            </span>
            <span style={{fontSize:'11px',fontWeight:700,
              color:insufficient?(isLight?'#BE123C':'#fda4af'):(isLight?meta.color:'rgba(200,215,255,.75)')}}>
              {remaining} days remaining
            </span>
          </div>
          {/* Base bar */}
          <div style={{height:'6px',borderRadius:'4px',background:isLight?'rgba(0,0,0,.07)':'rgba(255,255,255,.09)',overflow:'hidden',position:'relative'}}>
            <div style={{height:'100%',borderRadius:'4px',background:`rgba(${meta.rgb},.30)`,
              width:`${usedPct}%`,transition:'width .5s'}} />
            {workingDays > 0 && !insufficient && (
              <div style={{position:'absolute',top:0,left:`${usedPct}%`,height:'100%',
                background:`rgba(${meta.rgb},.72)`,
                width:`${Math.round((workingDays/maxDays)*100)}%`,transition:'width .4s'}} />
            )}
            {insufficient && (
              <div style={{position:'absolute',top:0,left:`${usedPct}%`,height:'100%',
                background:'rgba(225,29,72,.72)',
                width:`${Math.round((remaining/maxDays)*100)}%`,transition:'width .4s'}} />
            )}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:'5px',fontSize:'10px',color:textSub}}>
            <span>Used: {usedDays + (workingDays && !insufficient ? workingDays : 0)} days</span>
            <span>Max: {maxDays} days</span>
          </div>
          {errors.balance && (
            <div style={{marginTop:'6px',fontSize:'11px',color:isLight?'#BE123C':'#fda4af',
              display:'flex',alignItems:'center',gap:'5px'}}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <line x1="6" y1="3.5" x2="6" y2="6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="6" cy="8.5" r=".65" fill="currentColor"/>
              </svg>
              {errors.balance}
            </div>
          )}
        </div>

        {/* Dates */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px'}}>
          <div>
            <label style={{fontSize:'11px',fontWeight:700,color:textSub,textTransform:'uppercase',
              letterSpacing:'.06em',display:'block',marginBottom:'6px'}}>Start Date</label>
            <input type="date" value={startDate} min={todayISO()}
              onChange={e => { setStart(e.target.value); setErrors({}); if (!endDate) setEnd(e.target.value); }}
              style={{width:'100%',padding:'9px 12px',borderRadius:'8px',
                background:inputBg,border:`1px solid ${errors.start?'rgba(225,29,72,.55)':border}`,
                color:inputClr,fontSize:'13px',fontFamily:'inherit',outline:'none',boxSizing:'border-box',
                colorScheme: isLight ? 'light' : 'dark'}}/>
            {errors.start && <div style={{fontSize:'10px',color:isLight?'#BE123C':'#fda4af',marginTop:'3px'}}>{errors.start}</div>}
          </div>
          <div>
            <label style={{fontSize:'11px',fontWeight:700,color:textSub,textTransform:'uppercase',
              letterSpacing:'.06em',display:'block',marginBottom:'6px'}}>
              End Date
              {halfDay && <span style={{marginLeft:'6px',fontWeight:600,opacity:.5}}>(half day)</span>}
            </label>
            <input type="date" value={halfDay ? startDate : endDate} min={startDate || todayISO()}
              disabled={halfDay}
              onChange={e => { setEnd(e.target.value); setErrors({}); }}
              style={{width:'100%',padding:'9px 12px',borderRadius:'8px',
                background: halfDay ? (isLight?'#f1f5f9':'#0d1117') : inputBg,
                border:`1px solid ${errors.end?'rgba(225,29,72,.55)':border}`,
                color: halfDay ? textSub : inputClr,
                fontSize:'13px',fontFamily:'inherit',outline:'none',boxSizing:'border-box',
                cursor: halfDay ? 'not-allowed' : 'text',
                colorScheme: isLight ? 'light' : 'dark'}}/>
            {errors.end && <div style={{fontSize:'10px',color:isLight?'#BE123C':'#fda4af',marginTop:'3px'}}>{errors.end}</div>}
          </div>
        </div>

        {/* Half-day toggle + Working days badge */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}>
            <div onClick={() => { setHalfDay(h => !h); setErrors({}); }}
              style={{width:'34px',height:'20px',borderRadius:'10px',
                background:halfDay?'linear-gradient(135deg,#2563EB,#1E40AF)':'rgba(0,0,0,.15)',
                position:'relative',cursor:'pointer',transition:'background .2s',flexShrink:0}}>
              <div style={{position:'absolute',top:'3px',left: halfDay?'17px':'3px',
                width:'14px',height:'14px',borderRadius:'50%',background:'white',
                boxShadow:'0 1px 4px rgba(0,0,0,.25)',transition:'left .18s cubic-bezier(.34,1.4,.64,1)'}}/>
            </div>
            <span style={{fontSize:'12px',fontWeight:600,color:textSub}}>Half day</span>
          </label>

          {(workingDays > 0) && (
            <div style={{display:'flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'20px',
              background:insufficient?'rgba(225,29,72,.10)':'rgba(37,99,235,.09)',
              border:`1px solid ${insufficient?'rgba(225,29,72,.20)':'rgba(37,99,235,.18)'}`,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{color:insufficient?'#E11D48':'#2563EB'}}>
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span style={{fontSize:'11px',fontWeight:700,
                color:insufficient?(isLight?'#BE123C':'#fda4af'):(isLight?'#1D4ED8':'#93c5fd')}}>
                {workingDays} working day{workingDays !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Reason */}
        <div style={{marginBottom:'22px'}}>
          <label style={{fontSize:'11px',fontWeight:700,color:textSub,textTransform:'uppercase',
            letterSpacing:'.06em',display:'block',marginBottom:'6px'}}>
            Reason
            <span style={{marginLeft:'6px',fontWeight:500,fontSize:'10px',opacity:.6,textTransform:'none',letterSpacing:0}}>optional</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Brief reason for leave…"
            rows={2}
            style={{width:'100%',padding:'10px 12px',borderRadius:'8px',
              background:inputBg,border:`1px solid ${border}`,
              color:inputClr,fontSize:'13px',fontFamily:'inherit',outline:'none',
              resize:'vertical',boxSizing:'border-box',lineHeight:1.5}}
          />
        </div>

        {/* Action buttons */}
        <div style={{display:'flex',gap:'10px'}}>
          <button onClick={onClose}
            style={{padding:'11px 20px',borderRadius:'10px',border:`1px solid ${border}`,
              background:'none',color:textSub,fontSize:'13px',fontWeight:700,
              fontFamily:'inherit',cursor:'pointer',transition:'background .14s'}}
            onMouseEnter={e=>e.currentTarget.style.background=isLight?'rgba(15,23,42,.05)':'rgba(255,255,255,.05)'}
            onMouseLeave={e=>e.currentTarget.style.background='none'}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting || insufficient}
            style={{flex:1,padding:'11px',borderRadius:'10px',border:'none',
              background: insufficient ? (isLight?'rgba(100,116,139,.12)':'rgba(100,116,139,.18)')
                : 'linear-gradient(135deg,#2563EB,#1E40AF)',
              color: insufficient ? textSub : '#fff',
              fontSize:'13px',fontWeight:700,fontFamily:'inherit',
              cursor: (submitting || insufficient) ? 'not-allowed' : 'pointer',
              opacity: submitting ? .75 : 1,
              display:'flex',alignItems:'center',justifyContent:'center',gap:'7px',
              transition:'opacity .15s',
            }}>
            {submitting ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{animation:'spin .7s linear infinite'}}>
                  <circle cx="7" cy="7" r="5.5" stroke="rgba(255,255,255,.3)" strokeWidth="1.8" fill="none"/>
                  <path d="M7 1.5a5.5 5.5 0 015.5 5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                </svg>
                Submitting…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7.5L5.5 11 12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Submit Request
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
