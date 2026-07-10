import { Link } from 'react-router-dom';

// TODO: replace with api call
const UPCOMING = [
  { day: '14', mon: 'Jul', name: 'Bastille Day', loc: 'All locations', daysAway: '12 days away', badgeClass: 'badge-blue', badge: 'Public', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { day: '15', mon: 'Aug', name: 'Independence Day', loc: 'Dubai office', daysAway: '44 days away', badgeClass: 'badge-green', badge: 'Public', color: 'linear-gradient(135deg,#10b981,#059669)' },
  { day: '25', mon: 'Aug', name: 'Summer Bank Holiday', loc: 'UK office', daysAway: '54 days away', badgeClass: 'badge-amber', badge: 'Restricted', color: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { day: '23', mon: 'Sep', name: 'National Day', loc: 'All locations', daysAway: '83 days away', badgeClass: 'badge-blue', badge: 'Public', color: 'linear-gradient(135deg,#ef4444,#dc2626)' },
  { day: '25', mon: 'Dec', name: 'Christmas Day', loc: 'All locations', daysAway: '176 days away', badgeClass: 'badge-blue', badge: 'Public', color: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
];

const PAST = [
  { day: '01', mon: 'Jan', name: "New Year's Day", loc: 'All locations', badge: 'Public' },
  { day: '18', mon: 'Apr', name: 'Good Friday', loc: 'UK office', badge: 'Public' },
  { day: '26', mon: 'May', name: 'Spring Bank Holiday', loc: 'UK office', badge: 'Public' },
];

export default function Holidays() {
  return (
    <main className="main">
      <style>{`
        .hlist{display:flex;flex-direction:column;gap:10px}
        .hi{display:flex;align-items:center;gap:16px;padding:14px 16px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);transition:background .2s}
        .hi:hover{background:rgba(255,255,255,.07)}
        html.light .hi{background:rgba(255,255,255,.40);border-color:rgba(0,0,0,.07)}
        html.light .hi:hover{background:rgba(255,255,255,.62)}
        .hbadge{width:50px;height:50px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(0,0,0,.25)}
        .hday{font-size:17px;font-weight:800;color:#fff;line-height:1}
        .hmon{font-size:9px;font-weight:700;color:rgba(255,255,255,.75);text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
        .hname{font-size:14px;font-weight:700;color:rgba(220,230,255,.90)}
        .hloc{font-size:11px;color:rgba(180,200,240,.45);margin-top:3px}
        html.light .hname{color:rgba(15,23,42,.88)}
        html.light .hloc{color:rgba(71,85,105,.50)}
        .days-away{font-size:11px;font-weight:600;color:rgba(167,139,250,.80);margin-left:auto;white-space:nowrap}
        .holidays-card{border-radius:18px;padding:22px;margin-bottom:16px}
      `}</style>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'28px',paddingRight:'56px'}}>
        <div>
          <div className="page-title">🗓️ Holidays</div>
          <div className="page-sub">Upcoming &amp; past public holidays</div>
        </div>
        <Link to="/" className="back-btn">← Back</Link>
      </div>

      {/* Upcoming */}
      <div className="holidays-card g">
        <div className="sec-lbl">Upcoming Holidays</div>
        <div className="hlist">
          {UPCOMING.map((h, i) => (
            <div key={i} className="hi">
              <div className="hbadge" style={{background:h.color}}>
                <span className="hday">{h.day}</span>
                <span className="hmon">{h.mon}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="hname">{h.name}</div>
                <div className="hloc">{h.loc}</div>
              </div>
              <span className="days-away">{h.daysAway}</span>
              <span className={`badge ${h.badgeClass}`} style={{marginLeft:'8px'}}>{h.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Past */}
      <div className="holidays-card g" style={{opacity:.75}}>
        <div className="sec-lbl">Past Holidays — 2026</div>
        <div className="hlist">
          {PAST.map((h, i) => (
            <div key={i} className="hi" style={{opacity:.65}}>
              <div className="hbadge" style={{background:'linear-gradient(135deg,#475569,#64748b)'}}>
                <span className="hday">{h.day}</span>
                <span className="hmon">{h.mon}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="hname">{h.name}</div>
                <div className="hloc">{h.loc}</div>
              </div>
              <span className="badge badge-gray">{h.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
