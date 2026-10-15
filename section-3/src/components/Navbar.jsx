import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldAlert, CheckCircle, UserCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout, routeNotice, clearRouteNotice } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-logo">🛡️</span>
            <div>
              <h1 className="brand-title">Project Access Control</h1>
              <p className="brand-subtitle">ระบบจัดการสิทธิ์และงานโครงการ</p>
            </div>
          </div>

          {user && (
            <div className="navbar-user">
              <div className="user-profile">
                <span className="user-avatar">{user.avatar || '👤'}</span>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <div className="user-role-badge-wrapper">
                    <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-employee'}`}>
                      {user.role === 'admin' ? '👑 Admin' : '💼 Employee'}
                    </span>
                    <span className="department-tag">{user.department}</span>
                  </div>
                </div>
              </div>

              <button onClick={handleLogout} className="btn-logout" title="ออกจากระบบ">
                <LogOut size={16} />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* แถบแจ้งเตือนเมื่อเกิดกรณี Route Guard Redirect */}
      {routeNotice && (
        <div className="route-alert-banner">
          <div className="route-alert-content">
            <ShieldAlert className="alert-icon" size={20} />
            <span className="alert-text">{routeNotice}</span>
          </div>
          <button onClick={clearRouteNotice} className="alert-close-btn" aria-label="ปิดการแจ้งเตือน">
            ✕
          </button>
        </div>
      )}
    </>
  );
}
