import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../mock/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  Clock3,
  Check,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  FolderKanban,
  Lock,
  Sparkles,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export default function EmployeePage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchMyTasks = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.getTasks(user);
      setTasks(res.tasks);
    } catch (err) {
      setErrorMessage(err.message || 'ไม่สามารถโหลดข้อมูล Task ของคุณได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleMarkDone = async (task) => {
    if (task.status === 'Done') return;

    setUpdatingTaskId(task.id);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.updateTaskStatus(task.id, 'Done', user);

      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? res.task : t))
      );

      setSuccessMessage(`อัปเดตภารกิจ "${task.title}" เป็น Done เรียบร้อยแล้ว!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะงาน');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  const todoCount = tasks.filter((t) => t.status === 'To Do').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="page-header-banner">
          <div>
            <div className="section-pill-tag">
              <span>PAWTRY TEAM WORKSPACE</span>
            </div>
            <h2 className="page-title">พื้นที่ทำงานพนักงาน (Employee Portal)</h2>
            <p className="page-subtitle">
              ยินดีต้อนรับคุณ {user?.name} · คุณสามารถจัดการและส่งมอบงานที่ได้รับมอบหมายได้ที่นี่
            </p>
          </div>

          <button
            onClick={fetchMyTasks}
            className="btn-refresh"
            disabled={loading}
            title="รีเฟรชข้อมูลภารกิจ"
          >
            <RefreshCw size={16} className={loading ? 'spinner' : ''} />
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>

        {errorMessage && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="success-alert">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* แถบสถิติสไตล์ส้ม Pawtry Thailand */}
        <div className="pawtry-stats-strip">
          <div className="stats-strip-item">
            <div className="strip-icon-box">
              <FolderKanban size={26} />
            </div>
            <div className="strip-content">
              <span className="strip-value">{tasks.length} ภารกิจ</span>
              <span className="strip-label">ภารกิจที่ได้รับมอบหมาย</span>
            </div>
          </div>

          <div className="stats-divider"></div>

          <div className="stats-strip-item">
            <div className="strip-icon-box">
              <Clock size={26} />
            </div>
            <div className="strip-content">
              <span className="strip-value">{todoCount} งาน</span>
              <span className="strip-label">ที่ต้องดำเนินการ (To Do)</span>
            </div>
          </div>

          <div className="stats-divider"></div>

          <div className="stats-strip-item">
            <div className="strip-icon-box">
              <CheckCircle2 size={26} />
            </div>
            <div className="strip-content">
              <span className="strip-value">{doneCount} งาน</span>
              <span className="strip-label">สำเร็จเรียบร้อย (Done)</span>
            </div>
          </div>

          <div className="stats-divider"></div>

          <div className="stats-strip-item">
            <div className="strip-icon-box">
              <Sparkles size={26} />
            </div>
            <div className="strip-content">
              <span className="strip-value">
                {tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%
              </span>
              <span className="strip-label">อัตราความสำเร็จ (Rate)</span>
            </div>
          </div>
        </div>

        {/* การ์ดรายการงาน */}
        <div className="pawtry-card task-list-card">
          <div className="card-header flex-between">
            <div className="card-header-title">
              <FolderKanban size={22} className="icon-pawtry-navy" />
              <h3>รายการงานที่ได้รับมอบหมาย</h3>
              <span className="permission-pill employee">
                <Briefcase size={11} style={{ display: 'inline', marginRight: '4px' }} />
                เฉพาะงานของฉัน
              </span>
            </div>

            <div className="filter-group">
              <Filter size={16} className="filter-icon" />
              <div className="filter-pill-container">
                <button
                  type="button"
                  className={`filter-pill ${filter === 'All' ? 'active' : ''}`}
                  onClick={() => setFilter('All')}
                >
                  ทั้งหมด ({tasks.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${filter === 'To Do' ? 'active' : ''}`}
                  onClick={() => setFilter('To Do')}
                >
                  To Do ({todoCount})
                </button>
                <button
                  type="button"
                  className={`filter-pill ${filter === 'Done' ? 'active' : ''}`}
                  onClick={() => setFilter('Done')}
                >
                  Done ({doneCount})
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2 className="spinner" size={36} />
              <p>กำลังดึงข้อมูลงานของคุณผ่าน Mock API...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>
                {filter === 'All'
                  ? 'ยังไม่มีงานที่มอบหมายให้คุณในขณะนี้'
                  : `ไม่มีงานที่อยู่ในสถานะ "${filter}"`}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="task-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>ชื่องาน (Task Title)</th>
                    <th style={{ width: '150px' }}>สถานะ</th>
                    <th style={{ width: '180px' }}>วันที่มอบหมาย</th>
                    <th style={{ width: '180px', textAlign: 'center' }}>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const isUpdating = updatingTaskId === task.id;
                    const isDone = task.status === 'Done';

                    return (
                      <tr key={task.id} className={isDone ? 'row-done' : ''}>
                        <td className="task-id">#{task.id}</td>
                        <td className="task-title-cell">
                          <span className={`task-title-text ${isDone ? 'done-text' : ''}`}>
                            {task.title}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge-pawtry ${isDone ? 'status-done' : 'status-todo'}`}
                          >
                            {isDone ? (
                              <>
                                <CheckCircle2 size={13} className="badge-svg-icon done" />
                                <span>Done</span>
                              </>
                            ) : (
                              <>
                                <Clock3 size={13} className="badge-svg-icon todo" />
                                <span>To Do</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="date-cell">{task.created_at}</td>
                        <td style={{ textAlign: 'center' }}>
                          {isDone ? (
                            <div className="locked-done-badge" title="งานเสร็จสิ้นแล้ว ไม่สามารถย้อนกลับได้ตามกฎระบบ">
                              <Lock size={13} />
                              <span>เสร็จสิ้น (ล็อก)</span>
                            </div>
                          ) : (
                            <button
                              id={`mark-done-btn-${task.id}`}
                              onClick={() => handleMarkDone(task)}
                              disabled={isUpdating}
                              className="btn-mark-done-pawtry"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 size={14} className="spinner" />
                                  <span>กำลังบันทึก...</span>
                                </>
                              ) : (
                                <>
                                  <Check size={16} />
                                  <span>เปลี่ยนเป็น Done</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
