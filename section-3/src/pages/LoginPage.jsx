import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INITIAL_USERS } from '../mock/mockData';
import { LogIn, AlertCircle, Loader2, Sparkles, User, Shield, ArrowRight, AlertTriangle, Briefcase } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated && user) {
    if (user.role === 'admin') navigate('/admin');
    else navigate('/employee');
  }

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!username.trim()) {
      setErrorMessage('กรุณาระบุ Username ก่อนเข้าสู่ระบบ');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const loggedInUser = await login(username);
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    } catch (err) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (u) => {
    setUsername(u.username);
    setErrorMessage('');
  };

  return (
    <div className="login-container">
      <div className="bg-glow-orange"></div>
      <div className="bg-glow-navy"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="brand-logo-container large">
            <span className="paw-icon">🐾</span>
            <span className="brand-pawtry">Pawtry</span>
            <span className="brand-thailand">thailand</span>
          </div>

          <div className="company-tagline-pill">
            <span>PAWTRY INTERNAL SYSTEM</span>
          </div>

          <h2 className="login-title">ระบบจัดการสิทธิ์และงานโครงการ</h2>
          <p className="login-desc">
            Project Access Control · เข้าสู่ระบบเพื่อจัดการภารกิจและโครงการของคุณ
          </p>
        </div>

        {errorMessage && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username-input">
              <User size={15} /> ชื่อผู้ใช้งาน (Username)
            </label>
            <input
              id="username-input"
              type="text"
              placeholder="กรอก username เช่น admin, employee1..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            id="login-submit-button"
            className="btn-pawtry-orange"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={18} />
                <span>กำลังเข้าสู่ระบบผ่าน Mock API...</span>
              </>
            ) : (
              <>
                <span>เข้าสู่ระบบเพื่อใช้งาน</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="quick-accounts-section">
          <div className="quick-accounts-title">
            <Sparkles size={14} className="sparkle-icon" />
            <span>เลือกบัญชีทดสอบด่วน (Quick Test Accounts):</span>
          </div>

          <div className="quick-account-buttons">
            {INITIAL_USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                className={`quick-acc-btn ${username === u.username ? 'active' : ''}`}
                onClick={() => handleQuickSelect(u)}
                disabled={loading}
              >
                <div
                  className="quick-avatar-initials"
                  style={{ background: u.avatarBg }}
                >
                  {u.initials}
                </div>
                <div className="acc-meta">
                  <span className="acc-username">{u.username}</span>
                  <span className={`acc-badge-pill ${u.role === 'admin' ? 'admin' : 'employee'}`}>
                    {u.role === 'admin' ? (
                      <>
                        <Shield size={10} />
                        <span>Admin</span>
                      </>
                    ) : (
                      <>
                        <Briefcase size={10} />
                        <span>Employee</span>
                      </>
                    )}
                  </span>
                </div>
              </button>
            ))}

            <button
              type="button"
              className={`quick-acc-btn error-case ${username === 'invalid_user' ? 'active' : ''}`}
              onClick={() => {
                setUsername('invalid_user');
                setErrorMessage('');
              }}
              disabled={loading}
            >
              <div className="quick-avatar-initials error">
                <AlertTriangle size={15} />
              </div>
              <div className="acc-meta">
                <span className="acc-username">invalid_user</span>
                <span className="acc-badge-pill error">
                  <span>ทดสอบ Error</span>
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p>
            * ตรวจสอบสิทธิ์ผ่านจำลอง Asynchronous API (Promise + setTimeout 500ms)
          </p>
        </div>
      </div>
    </div>
  );
}
