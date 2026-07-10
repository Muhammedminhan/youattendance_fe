import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EMPS } from '../data/employees';

function statusKey(status) {
  if (status === 'On Leave') return 'leave';
  if (status === 'Low Balance') return 'low';
  return 'active';
}
function badgeInfo(status) {
  if (status === 'On Leave') return { cls: 'badge-red', label: 'On Leave', ring: 'ring-red' };
  if (status === 'Low Balance') return { cls: 'badge-amber', label: 'Low Balance', ring: 'ring-amber' };
  return { cls: 'badge-green', label: 'Active', ring: 'ring-green' };
}

const EMPLOYEE_LIST = Object.values(EMPS).map(e => {
  const { cls, label, ring } = badgeInfo(e.status);
  const totalMax = e.balance.find(b => b.name === 'Annual Leave')?.max || 20;
  return {
    id: e.id,
    name: e.name,
    dept: e.dept,
    days: e.stats.total,
    total: totalMax,
    status: statusKey(e.status),
    color: e.color,
    ringClass: ring,
    badgeClass: cls,
    badgeLabel: label,
    types: e.balance.filter(b => b.used > 0).map(b => b.name.replace(' Leave','')).join(', '),
    barColor: e.color.replace('135deg', '90deg'),
  };
});

const SORT_META = {
  'default':     { label: 'Default' },
  'most-leave':  { label: 'Most Leaves' },
  'least-leave': { label: 'Least Leaves' },
  'on-leave':    { label: 'On Leave First' },
  'low-balance': { label: 'Low Balance' },
  'name':        { label: 'Name A–Z' },
  'dept':        { label: 'Department' },
};

const STATUS_ORDER = { leave: 0, low: 1, active: 2 };

export default function Employees() {
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState('default');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading] = useState(false);
  const [error] = useState(null);

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">Failed to load data</div>;

  const sorted = useMemo(() => {
    let list = [...EMPLOYEE_LIST];
    if (sortMode === 'most-leave')  list.sort((a,b) => b.days - a.days);
    else if (sortMode === 'least-leave') list.sort((a,b) => a.days - b.days);
    else if (sortMode === 'on-leave')    list.sort((a,b) => (STATUS_ORDER[a.status]??9) - (STATUS_ORDER[b.status]??9));
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
        .emp-card{border-radius:18px;padding:20px;text-decoration:none;color:inherit;display:block;transition:transform .2s,box-shadow .2s,border-left-color .2s;border-left:3px solid transparent}
        .emp-card:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,.30)}
        .emp-card.status-leave:hover{border-left-color:#ef4444}
        .emp-card.status-active:hover{border-left-color:#10b981}
        .emp-card.status-low:hover{border-left-color:#f59e0b}
        .emp-top{display:flex;align-items:flex-start;gap:14px;margin-bottom:14px}
        .emp-avatar{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;flex-shrink:0}
        .ring-red{box-shadow:0 0 0 3px rgba(239,68,68,.60),0 4px 14px rgba(239,68,68,.28)}
        .ring-green{box-shadow:0 0 0 3px rgba(16,185,129,.55),0 4px 14px rgba(16,185,129,.22)}
        .ring-amber{box-shadow:0 0 0 3px rgba(245,158,11,.55),0 4px 14px rgba(245,158,11,.22)}
        .emp-name{font-size:14px;font-weight:700;color:rgba(220,230,255,.92);margin-bottom:2px}
        .emp-id{font-size:11px;color:rgba(180,200,240,.40);margin-bottom:4px}
        .emp-dept{font-size:11px;font-weight:600;color:rgba(160,180,240,.55);letter-spacing:.02em}
        .emp-stat{font-size:12px;color:rgba(180,200,240,.55);margin-bottom:4px}
        .leave-bar-wrap{margin-top:12px}
        .leave-bar-label{display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:rgba(180,200,240,.45);margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em}
        .leave-bar-bg{height:6px;border-radius:3px;background:rgba(255,255,255,.10);overflow:hidden}
        html.light .leave-bar-bg{background:rgba(0,0,0,.08)}
        .leave-bar{height:100%;border-radius:3px;transition:width .4s ease}
        .emp-footer{margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07);font-size:11px;font-weight:700;color:#a78bfa;display:flex;justify-content:flex-end}
        html.light .emp-name{color:rgba(15,23,42,.88)}
        html.light .emp-id{color:rgba(71,85,105,.50)}
        html.light .emp-dept{color:rgba(71,85,105,.45)}
        html.light .emp-stat{color:rgba(71,85,105,.60)}
        html.light .emp-footer{border-top-color:rgba(0,0,0,.07)}
        .sort-wrap{position:relative;display:inline-block;margin-bottom:20px}
        .sort-trigger{display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:12px;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.11);color:rgba(200,210,240,.85);font-size:12px;font-weight:700;font-family:inherit;cursor:pointer;transition:all .18s;white-space:nowrap;backdrop-filter:blur(8px)}
        .sort-trigger:hover{background:rgba(99,102,241,.14);border-color:rgba(99,102,241,.30)}
        html.light .sort-trigger{background:rgba(255,255,255,.82);border-color:rgba(200,210,240,.65);color:rgba(30,40,80,.80)}
        .sort-dropdown{position:absolute;top:calc(100% + 8px);left:0;z-index:200;width:260px;border-radius:16px;overflow:hidden;background:rgba(18,22,36,.92);border:1px solid rgba(255,255,255,.10);box-shadow:0 20px 60px rgba(0,0,0,.50);backdrop-filter:blur(24px)}
        html.light .sort-dropdown{background:rgba(255,255,255,.96);border-color:rgba(200,210,240,.60)}
        .sort-dropdown-header{padding:12px 16px 8px;font-size:10px;font-weight:800;color:rgba(140,150,190,.45);text-transform:uppercase;letter-spacing:.10em;border-bottom:1px solid rgba(255,255,255,.06)}
        .sort-item{display:flex;align-items:center;gap:12px;padding:11px 16px;cursor:pointer;transition:background .15s;border:none;background:none;width:100%;text-align:left;font-family:inherit}
        .sort-item:hover{background:rgba(99,102,241,.12)}
        .sort-item.active{background:rgba(99,102,241,.16)}
        html.light .sort-item:hover{background:rgba(99,102,241,.07)}
        html.light .sort-item.active{background:rgba(99,102,241,.09)}
        .sort-item-name{font-size:12px;font-weight:700;color:rgba(220,230,255,.90);line-height:1.2}
        html.light .sort-item-name{color:rgba(20,30,70,.85)}
      `}</style>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'28px'}}>
        <div>
          <div className="page-title">👥 Employees</div>
          <div className="page-sub">{Object.values(EMPS).filter(e => e.status !== 'Inactive').length} active employees</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
          <input
            className="search-inp"
            placeholder="🔍  Search by name or ID…"
            style={{width:'240px'}}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Link to="/" className="back-btn" style={{whiteSpace:'nowrap'}}>← Back</Link>
        </div>
      </div>

      {/* Sort dropdown */}
      <div className="sort-wrap">
        <button className="sort-trigger" onClick={() => setDropdownOpen(o => !o)}>
          <span>Sort by: </span>
          <span style={{color:'#a5b4fc'}}>{SORT_META[sortMode]?.label || 'Default'}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{transform:dropdownOpen?'rotate(180deg)':'',transition:'transform .22s',flexShrink:0}}><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {dropdownOpen && (
          <div className="sort-dropdown">
            <div className="sort-dropdown-header">Choose sort order</div>
            {Object.entries(SORT_META).map(([mode, meta]) => (
              <button
                key={mode}
                className={`sort-item${sortMode === mode ? ' active' : ''}`}
                onClick={() => { setSortMode(mode); setDropdownOpen(false); }}
              >
                <div style={{flex:1}}>
                  <div className="sort-item-name">{meta.label}</div>
                </div>
                {sortMode === mode && <span style={{color:'#a5b4fc',fontSize:'12px'}}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card-grid" id="grid">
        {filtered.map(emp => (
          <Link
            key={emp.id}
            className={`emp-card g status-${emp.status}`}
            to={`/employees/${emp.id}`}
          >
            <div className="emp-top">
              <div className={`emp-avatar ${emp.ringClass}`} style={{background:emp.color}}>{emp.avatar}</div>
              <div>
                <div className="emp-name">{emp.name}</div>
                <div className="emp-id">{emp.id}</div>
                <div className="emp-dept">{emp.dept}</div>
              </div>
            </div>
            <span className={`badge ${emp.badgeClass}`}>{emp.badgeLabel}</span>
            <div className="emp-stat" style={{marginTop:'10px'}}>📋 {emp.types}</div>
            <div className="leave-bar-wrap">
              <div className="leave-bar-label"><span>Days Used</span><span>{emp.days} / {emp.total}</span></div>
              <div className="leave-bar-bg">
                <div className="leave-bar" style={{width:`${Math.round(emp.days/emp.total*100)}%`,background:emp.barColor}}></div>
              </div>
            </div>
            <div className="emp-footer">View Profile →</div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty">
          <span className="empty-ico">🔍</span>
          <div className="empty-title">No employees found</div>
          <div className="empty-sub">Try a different name or ID</div>
        </div>
      )}
    </main>
  );
}
