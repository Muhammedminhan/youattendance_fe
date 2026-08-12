import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
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
