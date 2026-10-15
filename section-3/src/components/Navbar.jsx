import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldAlert, Shield, User, Briefcase } from 'lucide-react';

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
          {/* Logo & Brand Identity */}
          <div className="navbar-brand">
            <div className="brand-logo-container">
              <span className="paw-icon">🐾</span>
              <span className="brand-pawtry">Pawtry</span>
              <span className="brand-thailand">thailand</span>
            </div>
            <div className="brand-divider"></div>
            <div className="brand-system-tag">
              <span className="system-title">Task Access Control</span>
              <span className="system-badge">Internal System</span>
            </div>
          </div>

          {user && (
            <div className="navbar-user">
              <div className="user-profile-card">
                <div
                  className="user-initials-avatar"
                  style={{ background: user.avatarBg || '#ff7700' }}
                >
                  {user.initials || 'US'}
                </div>
                <div className="user-meta">
                  <span className="user-name">{user.name}</span>
                  <div className="user-tags">
                    <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-employee'}`}>
                      {user.role === 'admin' ? (
                        <>
                          <Shield size={11} />
                          <span>Admin</span>
                        </>
                      ) : (
                        <>
                          <Briefcase size={11} />
                          <span>Employee</span>
                        </>
                      )}
                    </span>
                    <span className="department-tag">{user.department}</span>
                  </div>
                </div>
              </div>

              <button onClick={handleLogout} className="btn-logout" title="ออกจากระบบ">
                <LogOut size={15} />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* แถบแจ้งเตือนเมื่อเกิด Route Guard Intercept */}
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
