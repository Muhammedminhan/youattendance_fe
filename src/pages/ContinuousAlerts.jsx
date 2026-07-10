import { Link } from 'react-router-dom';

// TODO: replace with api call
const ALERTS = [
  {
    variant: 'red',
    name: 'James Chen',
    id: 'EMP004',
    badge: '⚠ TOP PRIORITY',
    badgeClass: 'badge-red',
    pill: '🤒 Sick Leave',
    pillClass: 'tp-red',
    dateFrom: '30 Jun 2026',
    dateTo: '2 Jul 2026',
    days: 3,
    daysClass: 'days-red',
    since: 'Started 3 days ago — 30 Jun 2026',
    footer: '🏥 Requires immediate HR follow-up',
    empId: 'EMP004',
  },
  {
    variant: 'amber',
    name: 'Sarah Johnson',
    id: 'EMP001',
    badge: '👁 MONITOR',
    badgeClass: 'badge-amber',
    pill: '📋 Annual Leave',
    pillClass: 'tp-amber',
    dateFrom: '24 Jun 2026',
    dateTo: '28 Jun 2026',
    days: 5,
    daysClass: 'days-amber',
    since: 'Started 8 days ago — 24 Jun 2026',
    footer: '📌 Keep monitoring',
    empId: 'EMP001',
  },
  {
    variant: 'amber',
    name: 'Nadia Khalil',
    id: 'EMP009',
    badge: '👁 MONITOR',
    badgeClass: 'badge-amber',
    pill: '📋 Annual Leave',
    pillClass: 'tp-amber',
    dateFrom: '1 Jul 2026',
    dateTo: '5 Jul 2026',
    days: 5,
    daysClass: 'days-amber',
    since: 'Started 1 day ago — 1 Jul 2026',
    footer: '📌 Keep monitoring',
    empId: null,
  },
];

export default function ContinuousAlerts() {
  return (
    <main className="main">
      <style>{`
        .summary-bar{border-radius:18px;padding:18px 22px;margin-bottom:22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px}
        .sb-icon{width:52px;height:52px;border-radius:15px;background:linear-gradient(135deg,#ef4444,#dc2626);display:flex;align-items:center;justify-content:center;font-size:24px;animation:pulse-ring 2s ease-in-out infinite}
        .sb-pulse-dot{position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;background:#ef4444;border:2px solid rgba(14,11,40,1);animation:pulse-dot 1.6s ease-in-out infinite}
        html.light .sb-pulse-dot{border-color:#dde3f0}
        .sb-title{font-size:16px;font-weight:800;color:rgba(255,255,255,.95)}
        .sb-sub{font-size:12px;color:rgba(180,200,240,.50);margin-top:3px}
        html.light .sb-title{color:rgba(15,23,42,.92)}
        html.light .sb-sub{color:rgba(71,85,105,.55)}
        .aec{border-radius:18px;padding:20px;text-decoration:none;color:inherit;display:block;transition:transform .22s,box-shadow .22s;border-left:4px solid transparent}
        .aec:hover{transform:translateY(-5px)}
        .aec-red{background:rgba(239,68,68,.10);border:1px solid rgba(239,68,68,.28);border-left:4px solid #ef4444}
        .aec-red:hover{box-shadow:0 14px 36px rgba(239,68,68,.25)}
        .aec-amber{background:rgba(245,158,11,.09);border:1px solid rgba(245,158,11,.24);border-left:4px solid #f59e0b}
        .aec-amber:hover{box-shadow:0 14px 36px rgba(245,158,11,.20)}
        html.light .aec-red{background:rgba(254,226,226,.60);border-color:rgba(239,68,68,.28);border-left-color:#ef4444}
        html.light .aec-amber{background:rgba(254,243,199,.60);border-color:rgba(245,158,11,.26);border-left-color:#f59e0b}
        .aec-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:14px}
        .av{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;flex-shrink:0}
        .av-red{background:linear-gradient(135deg,#ef4444,#f87171);box-shadow:0 3px 14px rgba(239,68,68,.45)}
        .av-amber{background:linear-gradient(135deg,#f59e0b,#fbbf24);box-shadow:0 3px 14px rgba(245,158,11,.40)}
        .aec-name{font-size:14px;font-weight:700;color:rgba(220,230,255,.94)}
        .aec-id{font-size:10px;color:rgba(180,200,240,.42);margin-top:3px}
        html.light .aec-name{color:rgba(15,23,42,.90)}
        html.light .aec-id{color:rgba(71,85,105,.50)}
        .type-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:14px}
        .tp-red{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.32);color:#fca5a5}
        .tp-amber{background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.28);color:#fde68a}
        .timeline{padding:10px 14px;border-radius:11px;margin-bottom:14px}
        .tl-red{background:rgba(239,68,68,.07)}
        .tl-amber{background:rgba(245,158,11,.06)}
        .tl-dates{display:flex;justify-content:space-between;margin-bottom:7px}
        .tl-date{font-size:11px;font-weight:600;color:rgba(180,200,240,.70)}
        html.light .tl-date{color:rgba(71,85,105,.65)}
        .bar-bg{height:6px;border-radius:3px;background:rgba(255,255,255,.10);overflow:hidden}
        html.light .bar-bg{background:rgba(0,0,0,.08)}
        .bar-red{height:100%;border-radius:3px;background:linear-gradient(90deg,#ef4444,rgba(239,68,68,.25))}
        .bar-amber{height:100%;border-radius:3px;background:linear-gradient(90deg,#f59e0b,rgba(245,158,11,.25))}
        .days-row{display:flex;align-items:baseline;gap:7px;margin-bottom:8px}
        .days-num{font-size:52px;font-weight:800;line-height:1;letter-spacing:-.04em}
        .days-red{color:#f87171;text-shadow:0 0 20px rgba(239,68,68,.50)}
        .days-amber{color:#fbbf24;text-shadow:0 0 20px rgba(245,158,11,.50)}
        html.light .days-red{color:#dc2626;text-shadow:none}
        html.light .days-amber{color:#d97706;text-shadow:none}
        .days-lbl{font-size:13px;font-weight:600;color:rgba(180,200,240,.48)}
        html.light .days-lbl{color:rgba(71,85,105,.55)}
        .days-since{font-size:11px;font-weight:600;color:rgba(180,200,240,.38);margin-bottom:14px;letter-spacing:.02em}
        html.light .days-since{color:rgba(71,85,105,.48)}
        .aec-footer{padding-top:12px;border-top:1px solid rgba(255,255,255,.07);font-size:11px;color:rgba(180,200,240,.44);display:flex;align-items:center;justify-content:space-between}
        html.light .aec-footer{border-top-color:rgba(0,0,0,.07);color:rgba(71,85,105,.50)}
        .view-link{font-size:11px;font-weight:700;color:#a78bfa}
      `}</style>

      <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'22px',flexWrap:'wrap'}}>
        <Link to="/" className="back-btn">← Dashboard</Link>
        <div className="page-title" style={{fontSize:'18px',display:'flex',alignItems:'center',gap:'8px'}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a6 6 0 0 1 6 6c0 3.5 1.5 5 1.5 5H2.5S4 11.5 4 8a6 6 0 0 1 6-6z" fill="rgba(239,68,68,.90)"/><path d="M8 15.5a2 2 0 0 0 4 0" stroke="rgba(239,68,68,.90)" strokeWidth="1.5" fill="none" strokeLinecap="round"/><circle cx="15" cy="4" r="3" fill="#ef4444"/></svg>
          Continuous Leave Alerts
        </div>
      </div>

      {/* Summary bar */}
      <div className="summary-bar g">
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{position:'relative',flexShrink:0}}>
            <div className="sb-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 3a7 7 0 0 1 7 7c0 4 1.8 6 1.8 6H3.2S5 14 5 10a7 7 0 0 1 7-7z" fill="white" opacity=".95"/><path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
            </div>
            <div className="sb-pulse-dot"></div>
          </div>
          <div>
            <div className="sb-title">3 employees on extended leave</div>
            <div className="sb-sub">Absent 3+ consecutive days in the last 30 days</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
          <span className="badge badge-red">🔴 1 Sick Priority</span>
          <span className="badge badge-gray">3 total alerts</span>
        </div>
      </div>

      {/* Alert cards */}
      <div className="card-grid">
        {ALERTS.map((a, i) => (
          <Link key={i} className={`aec aec-${a.variant}`} to={a.empId ? `/employees/${a.empId}` : '#'}>
            <div className="aec-head">
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div className={`av av-${a.variant}`}>{a.name[0]}</div>
                <div>
                  <div className="aec-name">{a.name}</div>
                  <div className="aec-id">{a.id}</div>
                </div>
              </div>
              <span className={`badge ${a.badgeClass}`}>{a.badge}</span>
            </div>
            <div className={`type-pill ${a.pillClass}`}>{a.pill}</div>
            <div className={`timeline tl-${a.variant}`}>
              <div className="tl-dates">
                <span className="tl-date">{a.dateFrom}</span>
                <span style={{color:'rgba(180,200,240,.35)'}}>→</span>
                <span className="tl-date">{a.dateTo}</span>
              </div>
              <div className="bar-bg"><div className={`bar-${a.variant}`} style={{width:'100%'}}></div></div>
            </div>
            <div className="days-row">
              <span className={`days-num ${a.daysClass}`}>{a.days}</span>
              <span className="days-lbl">consecutive days absent</span>
            </div>
            <div className="days-since">{a.since}</div>
            <div className="aec-footer">
              <span>{a.footer}</span>
              <span className="view-link">View Profile →</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
