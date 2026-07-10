import { useState } from 'react';
import { Link } from 'react-router-dom';

// TODO: replace with api call
const ON_LEAVE_TODAY = [
  { name: 'Sarah Johnson', type: '🗓 Annual Leave', typeClass: 'ol-type-annual' },
  { name: 'James Chen', type: '🤒 Sick Leave', typeClass: 'ol-type-sick' },
  { name: 'Nadia Khalil', type: '🗓 Annual Leave', typeClass: 'ol-type-annual' },
  { name: 'Tom Eriksen', type: '⚠️ Emergency', typeClass: 'ol-type-emergency' },
  { name: 'Fiona Murphy', type: '🗓 Annual Leave', typeClass: 'ol-type-annual' },
  { name: 'Arjun Mehta', type: '🏠 WFH', typeClass: 'ol-type-wfh' },
  { name: 'Chen Wei', type: '🤒 Sick Leave', typeClass: 'ol-type-sick' },
  { name: 'Layla Ahmed', type: '🗓 Annual Leave', typeClass: 'ol-type-annual' },
];

const RECORDS = [
  { employee: 'Sarah Johnson', type: 'Annual Leave', typeClass: 'ltype-annual', color: '#6366f1', from: '24 Jun 2026', to: '28 Jun 2026', days: 5, status: 'Active' },
  { employee: 'James Chen', type: 'Sick Leave', typeClass: 'ltype-sick', color: '#ef4444', from: '30 Jun 2026', to: '2 Jul 2026', days: 3, status: 'Active' },
  { employee: 'Nadia Khalil', type: 'Annual Leave', typeClass: 'ltype-annual', color: '#6366f1', from: '1 Jul 2026', to: '5 Jul 2026', days: 5, status: 'Active' },
  { employee: 'Tom Eriksen', type: 'Emergency', typeClass: 'ltype-emergency', color: '#f59e0b', from: '2 Jul 2026', to: '2 Jul 2026', days: 1, status: 'Active' },
  { employee: 'Priya Sharma', type: 'Annual Leave', typeClass: 'ltype-annual', color: '#6366f1', from: '20 Jun 2026', to: '24 Jun 2026', days: 5, status: 'Completed' },
  { employee: 'David Okafor', type: 'Sick Leave', typeClass: 'ltype-sick', color: '#ef4444', from: '18 Jun 2026', to: '19 Jun 2026', days: 2, status: 'Completed' },
  { employee: 'Lisa Park', type: 'Annual Leave', typeClass: 'ltype-annual', color: '#6366f1', from: '15 Jun 2026', to: '20 Jun 2026', days: 6, status: 'Completed' },
  { employee: 'Ravi Patel', type: 'WFH', typeClass: 'ltype-wfh', color: '#10b981', from: '10 Jun 2026', to: '11 Jun 2026', days: 2, status: 'Completed' },
  { employee: 'Amira Hassan', type: 'Emergency', typeClass: 'ltype-emergency', color: '#f59e0b', from: '5 Jun 2026', to: '5 Jun 2026', days: 1, status: 'Completed' },
  { employee: 'Mohammed Al Rashid', type: 'Annual Leave', typeClass: 'ltype-annual', color: '#6366f1', from: '1 Jun 2026', to: '5 Jun 2026', days: 5, status: 'Completed' },
];

export default function LeaveRecords() {
  const [search, setSearch] = useState('');

  const filtered = RECORDS.filter(r =>
    !search || r.employee.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="main">
      <style>{`
        .on-leave-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-bottom:20px}
        .ol-card{border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;background:rgba(239,68,68,.10);border:1px solid rgba(239,68,68,.25);border-left:4px solid #ef4444;transition:transform .18s,box-shadow .18s}
        .ol-card:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(239,68,68,.20)}
        .ol-dot{width:10px;height:10px;border-radius:50%;background:#ef4444;flex-shrink:0;box-shadow:0 0 0 3px rgba(239,68,68,.25);animation:pulse-dot 1.6s infinite}
        .ol-name{font-size:13px;font-weight:700;color:rgba(220,230,255,.90)}
        .ol-type{font-size:11px;margin-top:3px}
        .ol-type-annual{color:#a5b4fc}
        .ol-type-sick{color:#fca5a5}
        .ol-type-emergency{color:#fde68a}
        .ol-type-wfh{color:#6ee7b7}
        html.light .ol-name{color:rgba(15,23,42,.88)}
        html.light .ol-card{background:rgba(254,226,226,.55);border-color:rgba(239,68,68,.25);border-left-color:#ef4444}
        .ltype{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
        .ltype-annual{background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.28);color:#a5b4fc}
        .ltype-sick{background:rgba(239,68,68,.13);border:1px solid rgba(239,68,68,.28);color:#fca5a5}
        .ltype-emergency{background:rgba(245,158,11,.13);border:1px solid rgba(245,158,11,.26);color:#fde68a}
        .ltype-wfh{background:rgba(16,185,129,.13);border:1px solid rgba(16,185,129,.26);color:#6ee7b7}
        .ltype-unpaid{background:rgba(148,163,184,.10);border:1px solid rgba(148,163,184,.20);color:rgba(180,200,240,.55)}
        .records-card{border-radius:18px;padding:20px;margin-bottom:16px}
        .tbl-wrap{overflow-x:auto}
      `}</style>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'28px',paddingRight:'56px'}}>
        <div>
          <div className="page-title">📋 Leave Records</div>
          <div className="page-sub">All leave requests and current absences</div>
        </div>
        <Link to="/" className="back-btn">← Back</Link>
      </div>

      <div className="sec-lbl">On Leave Today — {ON_LEAVE_TODAY.length} employees</div>
      <div className="on-leave-grid">
        {ON_LEAVE_TODAY.map((e, i) => (
          <div key={i} className="ol-card">
            <div className="ol-dot"></div>
            <div>
              <div className="ol-name">{e.name}</div>
              <div className={`ol-type ${e.typeClass}`}>{e.type}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="records-card g">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'14px',marginBottom:'16px',flexWrap:'wrap'}}>
          <div className="sec-lbl" style={{marginBottom:0}}>All Records</div>
          <input
            className="search-inp"
            placeholder="🔍  Search employee or type…"
            style={{maxWidth:'260px'}}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td>{r.employee}</td>
                  <td>
                    <span className={`ltype ${r.typeClass}`}>
                      <span style={{width:'7px',height:'7px',borderRadius:'50%',background:r.color,display:'inline-block',flexShrink:0}}></span>
                      {r.type}
                    </span>
                  </td>
                  <td>{r.from}</td>
                  <td>{r.to}</td>
                  <td>{r.days}</td>
                  <td>{r.status === 'Active' ? <span className="badge badge-red">Active</span> : <span className="badge badge-gray">Completed</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
