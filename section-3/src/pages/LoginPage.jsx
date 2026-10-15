import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { INITIAL_USERS } from '../mock/mockData';
import { LogIn, AlertCircle, Loader2, Sparkles, User, Shield } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // หากล็อกอินอยู่แล้ว ให้ไปที่หน้าตามบทบาท
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
      // นำทางไปยังหน้าของ Role นั้น ๆ
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
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-box">
            <Shield size={32} className="shield-icon" />
          </div>
          <h2>เข้าสู่ระบบเพื่อใช้งาน</h2>
          <p className="login-desc">
            Project Access Control System · แบบทดสอบคัดเลือกนักศึกษาฝึกงาน
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
              <User size={16} /> ชื่อผู้ใช้งาน (Username)
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
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={18} />
                <span>กำลังตรวจสอบข้อมูลผ่าน Mock API...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>เข้าสู่ระบบ</span>
              </>
            )}
          </button>
        </form>

        <div className="quick-accounts-section">
          <div className="quick-accounts-title">
            <Sparkles size={14} />
            <span>บัญชีสำหรับทดสอบ (คลิกเพื่อเลือกทันที):</span>
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
                <span className="acc-avatar">{u.avatar}</span>
                <div className="acc-meta">
                  <span className="acc-username">{u.username}</span>
                  <span className="acc-badge">
                    {u.role === 'admin' ? 'Admin' : 'Employee'}
                  </span>
                </div>
              </button>
            ))}

            {/* ปุ่มทดสอบกรณี Username ที่ไม่มีในระบบ (Error test case) */}
            <button
              type="button"
              className={`quick-acc-btn error-case ${username === 'invalid_user' ? 'active' : ''}`}
              onClick={() => {
                setUsername('invalid_user');
                setErrorMessage('');
              }}
              disabled={loading}
            >
              <span className="acc-avatar">⚠️</span>
              <div className="acc-meta">
                <span className="acc-username">invalid_user</span>
                <span className="acc-badge error">ทดสอบ Error</span>
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
