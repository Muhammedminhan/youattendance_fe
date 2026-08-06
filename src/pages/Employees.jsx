import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EMPS } from '../data/employees';
import { useTheme } from '../context/ThemeContext';
import BackButton from '../components/BackButton';

function statusKey(status) {
  if (status === 'On Leave')     return 'leave';
  if (status === 'Low Balance')  return 'low';
  return 'active';
}

const STATUS_META = {
  leave:  { rgb:'225,29,72',  ring:'rgba(225,29,72,.55)',  shadow:'rgba(225,29,72,.24)',  label:'On Leave',     darkText:'#fda4af', lightText:'#BE123C' },
  low:    { rgb:'217,119,6',  ring:'rgba(217,119,6,.55)',  shadow:'rgba(217,119,6,.22)',  label:'Low Balance',  darkText:'#fcd34d', lightText:'#B45309' },
  active: { rgb:'5,150,105',  ring:'rgba(5,150,105,.50)',  shadow:'rgba(5,150,105,.20)',  label:'Active',       darkText:'#6ee7b7', lightText:'#047857' },
};

function toCard(e) {
  const sk = statusKey(e.status);
  const sm = STATUS_META[sk];
  const totalMax = e.balance.find(b => b.name === 'Annual Leave')?.max || 20;
  return {
    id: e.id, name: e.name, dept: e.dept,
    days: e.stats.total, total: totalMax,
    statusKey: sk, statusMeta: sm,
    color: e.color,
    barColor: e.color.replace('135deg', '90deg'),
    types: e.balance.filter(b => b.used > 0).map(b => b.name.replace(' Leave','')).join(', '),
  };
}

const SORT_META = {
  'default':     { label:'Default',        icon:'⊞' },
  'most-leave':  { label:'Most Leaves',    icon:'↓' },
  'least-leave': { label:'Least Leaves',   icon:'↑' },
  'on-leave':    { label:'On Leave First', icon:'◉' },
  'low-balance': { label:'Low Balance',    icon:'⚠' },
  'name':        { label:'Name A–Z',       icon:'A' },
  'dept':        { label:'Department',     icon:'◫' },
};

const STATUS_ORDER = { leave: 0, low: 1, active: 2 };

export default function Employees() {
  const [search, setSearch]           = useState('');
  const [sortMode, setSortMode]       = useState('default');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isLight } = useTheme();

  const sorted = useMemo(() => {
    let list = Object.values(EMPS).map(toCard);
    if      (sortMode === 'most-leave')  list.sort((a,b) => b.days - a.days);
    else if (sortMode === 'least-leave') list.sort((a,b) => a.days - b.days);
    else if (sortMode === 'on-leave')    list.sort((a,b) => (STATUS_ORDER[a.statusKey]??9) - (STATUS_ORDER[b.statusKey]??9));
    else if (sortMode === 'low-balance') list.sort((a,b) => (a.total-a.days) - (b.total-b.days));
    else if (sortMode === 'name')        list.sort((a,b) => a.name.localeCompare(b.name));
    else if (sortMode === 'dept')        list.sort((a,b) => a.dept.localeCompare(b.dept));
    return list;
  }, [sortMode]);

  const filtered = useMemo(() => {
    if (!search) return sorted;
    const t = search.toLowerCase();
    return sorted.filter(e => e.name.toLowerCase().includes(t) || e.id.toLowerCase().includes(t));
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
            <div className="page-sub">{Object.values(EMPS).filter(e => e.status !== 'Inactive').length} active employees</div>
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

      {/* Employee grid */}
      <div className="card-grid" id="grid">
        {filtered.map(emp => {
          const sm = emp.statusMeta;
          const pct = Math.round(emp.days / emp.total * 100);
          return (
            <Link key={emp.id} className={`emp-card g status-${emp.statusKey}`} to={`/employees/${emp.id}`}
              style={{
                borderLeftColor: 'transparent',
                '--hover-border': sm.ring.replace('.55','1'),
              }}
              onMouseEnter={e => e.currentTarget.style.borderLeftColor = sm.ring}
              onMouseLeave={e => e.currentTarget.style.borderLeftColor = 'transparent'}
            >
              <div className="emp-top">
                {/* Avatar with status ring */}
                <div className="emp-avatar" style={{
                  background: emp.color,
                  boxShadow: `0 0 0 3px ${sm.ring}, 0 4px 14px ${sm.shadow}`,
                }}>
                  {emp.name[0]}
                </div>
                <div>
                  <div className="emp-name" style={{color:isLight?'rgba(15,23,42,.88)':'rgba(220,230,255,.92)'}}>{emp.name}</div>
                  <div className="emp-id" style={{color:isLight?'rgba(71,85,105,.50)':'rgba(180,200,240,.40)'}}>{emp.id}</div>
                  <div className="emp-dept" style={{color:isLight?'rgba(71,85,105,.55)':'rgba(160,180,240,.55)'}}>{emp.dept}</div>
                </div>
              </div>

              {/* Status badge */}
              <span className="status-pill" style={{
                background:`rgba(${sm.rgb},${isLight?'.08':'.14'})`,
                border:`1px solid rgba(${sm.rgb},${isLight?'.18':'.28'})`,
                color:isLight?sm.lightText:sm.darkText,
              }}>
                <span style={{width:'6px',height:'6px',borderRadius:'50%',background:`rgb(${sm.rgb})`,display:'inline-block',flexShrink:0}}/>
                {sm.label}
              </span>

              {/* Leave types used */}
              <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'10px',fontSize:'12px',color:isLight?'rgba(60,80,120,.55)':'rgba(180,200,240,.55)'}}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,opacity:.6}}>
                  <path d="M3 1h5.5L11 3.5V13H3V1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
                  <line x1="5" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                  <line x1="5" y1="8.5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                </svg>
                {emp.types || '—'}
              </div>

              {/* Days used progress bar */}
              <div className="leave-bar-wrap">
                <div className="leave-bar-label">
                  <span style={{color:isLight?'rgba(60,80,120,.45)':'rgba(180,200,240,.45)'}}>Days Used</span>
                  <span style={{color:isLight?'rgba(60,80,120,.60)':'rgba(180,200,240,.55)'}}>{emp.days} / {emp.total}</span>
                </div>
                <div className="leave-bar-bg" style={{background:isLight?'rgba(0,0,0,.07)':'rgba(255,255,255,.09)'}}>
                  <div className="leave-bar" style={{width:`${pct}%`,background:emp.barColor}}/>
                </div>
              </div>

              {/* Footer */}
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

      {filtered.length === 0 && (
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
