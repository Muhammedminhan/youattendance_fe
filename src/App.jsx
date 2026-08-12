import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useEffect, useState } from 'react';
import { SearchProvider } from './context/SearchContext';
import Sidebar from './components/Sidebar';
import SearchOverlay from './components/SearchOverlay';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import LeaveRecords from './pages/LeaveRecords';
import LeaveReports from './pages/LeaveReports';
import Holidays from './pages/Holidays';
import ContinuousAlerts from './pages/ContinuousAlerts';
import Compare from './pages/Compare';

function NotFound() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      minHeight:'100vh',gap:'16px',fontFamily:'Inter,sans-serif',color:'rgba(100,116,139,.70)'}}>
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <circle cx="28" cy="28" r="26" stroke="currentColor" strokeWidth="2" fill="none" opacity=".4"/>
        <text x="28" y="34" textAnchor="middle" fontSize="22" fontWeight="800" fill="currentColor">404</text>
      </svg>
      <div style={{fontSize:'18px',fontWeight:700,color:'rgba(15,23,42,.70)'}}>Page not found</div>
      <a href="/" style={{fontSize:'13px',color:'#2563eb',textDecoration:'none',fontWeight:600}}>
        ← Back to dashboard
      </a>
    </div>
  );
}

function ProtectedRoute() {
  const { user, logout } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) { setChecked(true); return; }
    const token = localStorage.getItem('yd-token');
    if (!token) { logout(); setChecked(true); return; }
    fetch('/api/v1/auth/me/', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.state !== 'success') logout();
        setChecked(true);
      })
      .catch(() => setChecked(true)); // network down — allow through, don't log out
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (!checked) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',
      fontFamily:'Inter,sans-serif',gap:'10px',color:'rgba(100,116,139,.55)',fontSize:'13px'}}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{animation:'spin .7s linear infinite'}}>
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="2" opacity=".25" fill="none"/>
        <path d="M9 2a7 7 0 017 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      </svg>
      Verifying session…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  return (
    <SearchProvider>
      <div style={{display:'flex',minHeight:'100vh'}}>
        <Sidebar />
        <div className="main-content" style={{flex:1,minWidth:0,position:'relative'}}>
          <Outlet />
        </div>
        <SearchOverlay />
      </div>
    </SearchProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        <Route path="/leave-records" element={<LeaveRecords />} />
        <Route path="/leave-reports" element={<LeaveReports />} />
        <Route path="/holidays" element={<Holidays />} />
        <Route path="/alerts" element={<ContinuousAlerts />} />
        <Route path="/compare" element={<Compare />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
