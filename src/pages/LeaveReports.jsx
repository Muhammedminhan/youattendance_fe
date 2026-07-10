import { useState } from 'react';
import { Link } from 'react-router-dom';

// TODO: replace with api call
const TAB_DATA = {
  week: [
    { rank: '🏆', rankClass: 'rank-num-gold', name: 'Sarah Johnson', days: '5 days', badgeClass: 'badge-red' },
    { rank: '2', name: 'Nadia Khalil', days: '4 days', badgeClass: 'badge-amber' },
    { rank: '3', name: 'James Chen', days: '3 days', badgeClass: 'badge-amber' },
  ],
  month: [
    { rank: '🏆', rankClass: 'rank-num-gold', name: 'Lisa Park', days: '11 days', badgeClass: 'badge-red' },
    { rank: '2', name: 'Sarah Johnson', days: '8 days', badgeClass: 'badge-red' },
    { rank: '3', name: 'James Chen', days: '7 days', badgeClass: 'badge-amber' },
    { rank: '4', name: 'Nadia Khalil', days: '6 days', badgeClass: 'badge-amber' },
    { rank: '5', name: 'Mohammed Al Rashid', days: '5 days', badgeClass: 'badge-blue' },
  ],
  year: [
    { rank: '🏆', rankClass: 'rank-num-gold', name: 'Lisa Park', days: '24 days', badgeClass: 'badge-red' },
    { rank: '2', name: 'James Chen', days: '19 days', badgeClass: 'badge-red' },
    { rank: '3', name: 'Sarah Johnson', days: '12 days', badgeClass: 'badge-amber' },
    { rank: '4', name: 'Ravi Patel', days: '11 days', badgeClass: 'badge-amber' },
    { rank: '5', name: 'Mohammed Al Rashid', days: '8 days', badgeClass: 'badge-blue' },
  ],
};

const TYPE_BREAKDOWN = [
  { name: 'Annual', dot: '#6366f1', barColor: 'linear-gradient(90deg,#6366f1,#8b5cf6)', width: '75%', count: 348, pct: '44%' },
  { name: 'Sick', dot: '#ef4444', barColor: 'linear-gradient(90deg,#ef4444,#f87171)', width: '38%', count: 176, pct: '22%' },
  { name: 'Emergency', dot: '#f59e0b', barColor: 'linear-gradient(90deg,#f59e0b,#fbbf24)', width: '20%', count: 91, pct: '11%' },
  { name: 'WFH', dot: '#10b981', barColor: 'linear-gradient(90deg,#10b981,#34d399)', width: '30%', count: 138, pct: '17%' },
  { name: 'Unpaid', dot: '#94a3b8', barColor: 'linear-gradient(90deg,#64748b,#94a3b8)', width: '10%', count: 44, pct: '6%' },
];

const LOW_BALANCE = [
  { name: 'Lisa Park', id: 'EMP007', bal: '1 day remaining', type: 'Annual Leave', badgeClass: 'badge-red', badge: 'Critical' },
  { name: 'James Chen', id: 'EMP004', bal: '2 days remaining', type: 'Annual Leave', badgeClass: 'badge-amber', badge: 'Low' },
  { name: 'Nadia Khalil', id: 'EMP009', bal: '3 days remaining', type: 'Sick Leave', badgeClass: 'badge-amber', badge: 'Low' },
];

export default function LeaveReports() {
  const [activeTab, setActiveTab] = useState('month');
  const [loading] = useState(false);
  const [error] = useState(null);

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">Failed to load data</div>;

  return (
    <main className="main">
      <style>{`
        .reports-card{border-radius:18px;padding:22px;margin-bottom:16px}
        .two-col-r{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .tab-row{display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap}
        .tab{padding:7px 16px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;border:none;background:rgba(255,255,255,.07);color:rgba(180,200,240,.65);transition:background .2s,color .2s;font-family:inherit}
        .tab.on{background:rgba(99,102,241,.25);color:#a5b4fc;border:1px solid rgba(99,102,241,.35)}
        html.light .tab{background:rgba(0,0,0,.06);color:rgba(71,85,105,.65)}
        html.light .tab.on{background:rgba(99,102,241,.14);color:#4f46e5}
        .rank-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)}
        .rank-row:last-child{border-bottom:none}
        html.light .rank-row{border-bottom-color:rgba(0,0,0,.06)}
        .rank-num{width:26px;height:26px;border-radius:8px;background:rgba(99,102,241,.20);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#a5b4fc;flex-shrink:0}
        .rank-num-gold{background:linear-gradient(135deg,rgba(251,191,36,.35),rgba(245,158,11,.25));border:1px solid rgba(251,191,36,.40);color:#fbbf24;box-shadow:0 2px 10px rgba(245,158,11,.25)}
        .rank-name{font-size:13px;font-weight:700;color:rgba(200,215,255,.88);flex:1}
        html.light .rank-name{color:rgba(30,41,59,.80)}
        .type-row{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(255,255,255,.06)}
        .type-row:last-child{border-bottom:none}
        html.light .type-row{border-bottom-color:rgba(0,0,0,.06)}
        .type-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .type-name{font-size:13px;font-weight:600;color:rgba(200,215,255,.80);width:90px;flex-shrink:0}
        .type-bar-bg{flex:1;height:8px;border-radius:4px;background:rgba(255,255,255,.10);overflow:hidden}
        html.light .type-bar-bg{background:rgba(0,0,0,.08)}
        .type-bar{height:100%;border-radius:4px}
        .type-cnt{font-size:12px;font-weight:700;color:rgba(180,200,240,.60);width:36px;text-align:right;flex-shrink:0}
        .type-pct{font-size:11px;font-weight:700;color:rgba(180,200,240,.40);width:36px;text-align:right;flex-shrink:0}
        html.light .type-name{color:rgba(51,65,85,.80)}
        html.light .type-cnt{color:rgba(71,85,105,.60)}
        html.light .type-pct{color:rgba(71,85,105,.40)}
        .low-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);gap:10px;flex-wrap:wrap}
        .low-row:last-child{border-bottom:none}
        html.light .low-row{border-bottom-color:rgba(0,0,0,.06)}
        .low-name{font-size:13px;font-weight:700;color:rgba(200,215,255,.88)}
        .low-bal{font-size:12px;color:rgba(245,158,11,.85);font-weight:700}
        html.light .low-name{color:rgba(30,41,59,.82)}
        @media(max-width:700px){.two-col-r{grid-template-columns:1fr}}
        @media print {
          .sidebar, .alert-banner, .sort-wrap { display: none !important; }
          body { background: white !important; }
          .report-modal-content { box-shadow: none !important; }
        }
      `}</style>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'12px',marginBottom:'28px'}}>
        <div>
          <div className="page-title">📈 Leave Reports</div>
          <div className="page-sub">Analytics, top takers, and balance alerts</div>
        </div>
        <Link to="/" className="back-btn">← Back</Link>
      </div>

      <div className="two-col-r" style={{marginBottom:'16px'}}>
        {/* Top Leave Takers */}
        <div className="reports-card g">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'14px',flexWrap:'wrap',gap:'8px'}}>
            <div className="sec-lbl" style={{marginBottom:0}}>Top Leave Takers</div>
            <div className="tab-row" style={{marginBottom:0}}>
              {['week','month','year'].map(t => (
                <button key={t} className={`tab${activeTab===t?' on':''}`} onClick={() => setActiveTab(t)}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {TAB_DATA[activeTab].map((r) => (
            <div key={r.name} className="rank-row">
              <div className={`rank-num${r.rankClass?' '+r.rankClass:''}`}>{r.rank}</div>
              <div className="rank-name">{r.name}</div>
              <span className={`badge ${r.badgeClass}`}>{r.days}</span>
            </div>
          ))}
        </div>

        {/* Leave by Type */}
        <div className="reports-card g">
          <div className="sec-lbl">Leave by Type — This Year</div>
          {TYPE_BREAKDOWN.map(t => (
            <div key={t.name} className="type-row">
              <div className="type-dot" style={{background:t.dot}}></div>
              <div className="type-name">{t.name}</div>
              <div className="type-bar-bg"><div className="type-bar" style={{width:t.width,background:t.barColor}}></div></div>
              <div className="type-cnt">{t.count}</div>
              <div className="type-pct">{t.pct}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Low balance alerts */}
      <div className="reports-card g">
        <div className="sec-lbl">⚠️ Low Leave Balance Alerts</div>
        {LOW_BALANCE.map((e) => (
          <div key={e.id} className="low-row">
            <div><div className="low-name">{e.name}</div><div style={{fontSize:'11px',color:'rgba(180,200,240,.45)'}}>{e.id}</div></div>
            <div style={{textAlign:'right'}}><div className="low-bal">{e.bal}</div><div style={{fontSize:'11px',color:'rgba(180,200,240,.40)'}}>{e.type}</div></div>
            <span className={`badge ${e.badgeClass}`}>{e.badge}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
