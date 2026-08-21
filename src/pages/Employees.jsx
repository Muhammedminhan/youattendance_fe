import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';
import { listEmployees } from '../api/employees';

function statusKey(status) {
  const s = (status || '').toLowerCase();
  if (s === 'terminated' || s === 'resigned' || s === 'deceased') return 'terminated';
  if (s === 'probation' || s === 'notice period') return 'low';
  return 'active';
}

const STATUS_META = {
  terminated: { rgb:'225,29,72',  ring:'rgba(225,29,72,.55)',  shadow:'rgba(225,29,72,.24)',  label:'Terminated',   darkText:'#fda4af', lightText:'#BE123C' },
  low:        { rgb:'217,119,6',  ring:'rgba(217,119,6,.55)',  shadow:'rgba(217,119,6,.22)',  label:'Probation',    darkText:'#fcd34d', lightText:'#B45309' },
  active:     { rgb:'5,150,105',  ring:'rgba(5,150,105,.50)',  shadow:'rgba(5,150,105,.20)',  label:'Active',       darkText:'#6ee7b7', lightText:'#047857' },
};

const CARD_COLORS = [
  'linear-gradient(135deg,#2563EB,#1E40AF)',
  'linear-gradient(135deg,#0891B2,#0E7490)',
  'linear-gradient(135deg,#059669,#047857)',
  'linear-gradient(135deg,#7C3AED,#6D28D9)',
  'linear-gradient(135deg,#D97706,#B45309)',
  'linear-gradient(135deg,#DC2626,#B91C1C)',
];

function toCard(e, idx) {
  const sk = statusKey(e.status);
  const sm = STATUS_META[sk];
  const color = CARD_COLORS[idx % CARD_COLORS.length];
  return {
    id: e.employee_id,
    name: e.employee_name,
    email: e.email || '',
    dept: `${e.shift_start_time}–${e.shift_end_time}`,
    statusKey: sk,
    statusMeta: sm,
    status: e.status,
    color,
    barColor: color.replace('135deg', '90deg'),
  };
}

const SORT_META = {
  'default':   { label:'Default',  icon:'⊞' },
  'name':      { label:'Name A–Z', icon:'A' },
  'on-leave':  { label:'Active',   icon:'◉' },
};

const STATUS_ORDER = { active: 0, low: 1, terminated: 2 };

export default function Employees() {
  const [search, setSearch]             = useState('');
  const [sortMode, setSortMode]         = useState('default');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [employees, setEmployees]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [apiError, setApiError]         = useState('');
  const { isLight } = useTheme();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listEmployees()
      .then(data => { if (!cancelled) { setEmployees(data); setLoading(false); } })
      .catch(err => {
        if (!cancelled) {
          // Network error (no backend) → show empty state, not a red error
          if (!err.response) { setLoading(false); return; }
          setApiError(err.response?.data?.errors?.message || 'Failed to load employees');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const sorted = useMemo(() => {
    let list = employees.map((e, i) => toCard(e, i));
    if      (sortMode === 'name')     list.sort((a,b) => a.name.localeCompare(b.name));
    else if (sortMode === 'on-leave') list.sort((a,b) => (STATUS_ORDER[a.statusKey]??9) - (STATUS_ORDER[b.statusKey]??9));
    return list;
  }, [sortMode, employees]);

  const filtered = useMemo(() => {
    if (!search) return sorted;
    const t = search.toLowerCase();
    return sorted.filter(e =>
      e.name.toLowerCase().includes(t) ||
      e.id.toLowerCase().includes(t) ||
      e.email.toLowerCase().includes(t),
    );
  }, [sorted, search]);

  return (
    <main className="main">
      <style>{`
        .emp-card{border-radius:18px;padding:20px;text-decoration:none;color:inherit;display:block;
          transition:transform .20s cubic-bezier(.34,1.2,.64,1),box-shadow .20s ease,border-left-color .20s;
          border-left:3px solid transparent}
        .emp-card:hover{transform:translateY(-4px)}

        .emp-top{display:flex;align-items:flex-start;gap:14px;margin-bottom:14px}
        .emp-avatar{width:54px;height:54px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800;color:#fff;flex-shrink:0}
        .emp-name{font-size:14px;font-weight:700;margin-bottom:2px}
        .emp-id{font-size:11px;margin-bottom:4px}
        .emp-dept{font-size:11px;font-weight:600;letter-spacing:.02em}

        .status-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 11px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}

        .leave-bar-wrap{margin-top:12px}
        .leave-bar-label{display:flex;justify-content:space-between;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px}
        .leave-bar-bg{height:6px;border-radius:3px;overflow:hidden}
        .leave-bar{height:100%;border-radius:3px;transition:width .4s ease}

        .emp-footer{margin-top:14px;padding-top:12px;font-size:11px;font-weight:700;
          display:flex;justify-content:flex-end;align-items:center;gap:5px;
          transition:gap .18s cubic-bezier(.34,1.2,.64,1)}
        .emp-card:hover .emp-footer{gap:9px}

        .sort-wrap{position:relative;display:inline-block;margin-bottom:20px}
        .sort-trigger{display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:12px;font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .18s;white-space:nowrap;backdrop-filter:blur(8px)}
        .sort-dropdown{position:absolute;top:calc(100% + 8px);left:0;z-index:200;width:240px;border-radius:16px;overflow:hidden;backdrop-filter:blur(24px)}
        .sort-dropdown-header{padding:12px 16px 8px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.10em;border-bottom:1px solid rgba(255,255,255,.06)}
        html.light .sort-dropdown-header{border-bottom-color:rgba(0,0,0,.07)}
        .sort-item{display:flex;align-items:center;gap:12px;padding:11px 16px;cursor:pointer;transition:background .15s;border:none;background:none;width:100%;text-align:left;font-family:inherit}
        .sort-item-name{font-size:12px;font-weight:700;line-height:1.2}

        .search-field{position:relative;display:flex;align-items:center}
        .search-ico{position:absolute;left:11px;pointer-events:none;opacity:.40}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'28px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <div style={{width:'44px',height:'44px',borderRadius:'14px',background:'linear-gradient(135deg,#059669,#047857)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(5,150,105,.35)',flexShrink:0}}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <circle cx="6" cy="5" r="2.5" fill="white" opacity=".9"/>
              <path d="M1 14c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".9"/>
              <circle cx="12.5" cy="5" r="2" fill="white" opacity=".60"/>
              <path d="M14 14c0-2.21-1.34-4.1-3.2-4.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".60"/>
            </svg>
          </div>
          <div>
            <div className="page-title">Employees</div>
            <div className="page-sub">
              {loading ? 'Loading…' : `${employees.filter(e => (e.status || '').toLowerCase() === 'active').length} active employees`}
            </div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
          <div className="search-field">
            <svg className="search-ico" width="15" height="15" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              className="search-inp"
              placeholder="Search by name or ID…"
              style={{width:'220px',paddingLeft:'30px'}}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <BackButton to="/" label="Back" />
        </div>
      </div>

      {/* Sort dropdown */}
      <div className="sort-wrap">
        <button className="sort-trigger" onClick={() => setDropdownOpen(o => !o)} style={{
          background: isLight?'rgba(255,255,255,.82)':'rgba(255,255,255,.07)',
          border: isLight?'1.5px solid rgba(200,210,240,.65)':'1.5px solid rgba(255,255,255,.11)',
          color: isLight?'rgba(30,40,80,.80)':'rgba(200,210,240,.85)',
        }}>
          <span>Sort by: </span>
          <span style={{color:isLight?'#2563EB':'#93c5fd'}}>{SORT_META[sortMode]?.label || 'Default'}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{transform:dropdownOpen?'rotate(180deg)':'',transition:'transform .22s',flexShrink:0}}>
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {dropdownOpen && (
          <div className="sort-dropdown" style={{
            background: isLight?'rgba(255,255,255,.97)':'rgba(15,19,32,.94)',
            border: isLight?'1px solid rgba(200,210,240,.60)':'1px solid rgba(255,255,255,.10)',
            boxShadow: '0 20px 60px rgba(0,0,0,.40)',
          }}>
            <div className="sort-dropdown-header" style={{color:isLight?'rgba(60,80,120,.42)':'rgba(140,150,190,.45)'}}>
              Sort order
            </div>
            {Object.entries(SORT_META).map(([mode, meta]) => {
              const on = sortMode === mode;
              return (
                <button key={mode} className="sort-item" onClick={() => { setSortMode(mode); setDropdownOpen(false); }}
                  style={{background: on ? (isLight?'rgba(37,99,235,.08)':'rgba(37,99,235,.14)') : 'transparent'}}>
                  <div style={{flex:1}}>
                    <div className="sort-item-name" style={{color:isLight?'rgba(20,30,70,.85)':'rgba(220,230,255,.90)'}}>{meta.label}</div>
                  </div>
                  {on && <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <polyline points="2,7 5.5,10.5 12,3.5" stroke={isLight?'#2563EB':'#93c5fd'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading / error states */}
      {loading && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',padding:'60px 0',
          color:isLight?'rgba(60,80,120,.55)':'rgba(140,160,210,.55)',fontSize:'14px'}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{animation:'spin .7s linear infinite'}}>
            <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.8" opacity=".25" fill="none"/>
            <path d="M9 2a7 7 0 017 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          </svg>
          Loading employees…
        </div>
      )}

      {apiError && !loading && (
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'20px 24px',borderRadius:'14px',
          background:isLight?'rgba(225,29,72,.06)':'rgba(225,29,72,.10)',
          border:`1px solid rgba(225,29,72,${isLight?'.14':'.22'})`,
          color:isLight?'#BE123C':'#fda4af',fontSize:'13px',marginBottom:'16px'}}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{flexShrink:0}}>
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" fill="none"/>
            <line x1="8" y1="5" x2="8" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="8" cy="11.5" r=".8" fill="currentColor"/>
          </svg>
          {apiError}
        </div>
      )}

      {/* Employee grid */}
      {!loading && !apiError && (
        <div className="card-grid" id="grid">
          {filtered.map(emp => {
            const sm = emp.statusMeta;
            return (
              <Link key={emp.id} className={`emp-card g status-${emp.statusKey}`} to={`/employees/${emp.id}`}
                style={{borderLeftColor:'transparent'}}
                onMouseEnter={e => e.currentTarget.style.borderLeftColor = sm.ring}
                onMouseLeave={e => e.currentTarget.style.borderLeftColor = 'transparent'}
              >
                <div className="emp-top">
                  <div className="emp-avatar" style={{
                    background: emp.color,
                    boxShadow: `0 0 0 3px ${sm.ring}, 0 4px 14px ${sm.shadow}`,
                  }}>
                    {(emp.name[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <div className="emp-name" style={{color:isLight?'rgba(15,23,42,.88)':'rgba(220,230,255,.92)'}}>{emp.name}</div>
                    <div className="emp-id" style={{color:isLight?'rgba(71,85,105,.50)':'rgba(180,200,240,.40)'}}>{emp.id}</div>
                    <div className="emp-dept" style={{color:isLight?'rgba(71,85,105,.55)':'rgba(160,180,240,.55)'}}>
                      {emp.email || emp.dept}
                    </div>
                  </div>
                </div>

                <span className="status-pill" style={{
                  background:`rgba(${sm.rgb},${isLight?'.08':'.14'})`,
                  border:`1px solid rgba(${sm.rgb},${isLight?'.18':'.28'})`,
                  color:isLight?sm.lightText:sm.darkText,
                }}>
                  <span style={{width:'6px',height:'6px',borderRadius:'50%',background:`rgb(${sm.rgb})`,display:'inline-block',flexShrink:0}}/>
                  {emp.status}
                </span>

                <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'10px',fontSize:'12px',
                  color:isLight?'rgba(60,80,120,.55)':'rgba(180,200,240,.55)'}}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{flexShrink:0,opacity:.6}}>
                    <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.3" fill="none"/>
                    <path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
                  </svg>
                  Shift: {emp.dept}
                </div>

                <div className="emp-footer" style={{
                  borderTop:`1px solid ${isLight?'rgba(0,0,0,.07)':'rgba(255,255,255,.07)'}`,
                  color:isLight?'#2563EB':'#93c5fd',
                }}>
                  View Profile
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    <polyline points="8,3 12,7 8,11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !apiError && filtered.length === 0 && (
        <div className="empty">
          <div style={{width:'56px',height:'56px',borderRadius:'18px',background:isLight?'rgba(37,99,235,.09)':'rgba(37,99,235,.14)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',border:`1px solid rgba(37,99,235,${isLight?'.14':'.24'})`}}>
            <svg width="26" height="26" viewBox="0 0 16 16" fill="none" style={{opacity:.6}}>
              <circle cx="6.5" cy="6.5" r="5" stroke={isLight?'#2563EB':'#93c5fd'} strokeWidth="1.5"/>
              <line x1="10.5" y1="10.5" x2="14" y2="14" stroke={isLight?'#2563EB':'#93c5fd'} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="empty-title">No employees found</div>
          <div className="empty-sub">Try a different name or ID</div>
        </div>
      )}
    </main>
  );
}
