import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../mock/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Clock,
  Check,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  FolderKanban,
  Lock
} from 'lucide-react';

export default function EmployeePage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All' | 'To Do' | 'Done'
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // โหลด Tasks เฉพาะของผู้ใช้คนนี้
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

  // Employee เปลี่ยนสถานะ To Do -> Done เท่านั้น
  const handleMarkDone = async (task) => {
    if (task.status === 'Done') return;

    setUpdatingTaskId(task.id);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.updateTaskStatus(task.id, 'Done', user);

      // อัปเดตรายการทันที
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? res.task : t))
      );

      setSuccessMessage(`อัปเดตงาน "${task.title}" เป็น Done เรียบร้อยแล้ว!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะงาน');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // กรอง Tasks ตามสถานะ
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
        <div className="page-header">
          <div>
            <h2 className="page-title">พื้นที่ทำงานพนักงาน (Employee Portal)</h2>
            <p className="page-subtitle">
              ยินดีต้อนรับคุณ {user?.name} · คุณสามารถจัดการและส่งมอบงานที่ได้รับมอบหมายได้ที่นี่
            </p>
          </div>

          <button
            onClick={fetchMyTasks}
            className="btn-secondary"
            disabled={loading}
            title="รีเฟรชข้อมูลงาน"
          >
            <RefreshCw size={16} className={loading ? 'spinner' : ''} />
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* ข้อความแจ้งเตือนสถานะ */}
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

        {/* สรุปงานของตนเอง */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <FolderKanban size={22} />
            </div>
            <div className="stat-data">
              <span className="stat-value">{tasks.length}</span>
              <span className="stat-label">งานของฉันทั้งหมด</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper amber">
              <Clock size={22} />
            </div>
            <div className="stat-data">
              <span className="stat-value">{todoCount}</span>
              <span className="stat-label">งานที่ต้องทำ (To Do)</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-data">
              <span className="stat-value">{doneCount}</span>
              <span className="stat-label">งานที่เสร็จแล้ว (Done)</span>
            </div>
          </div>
        </div>

        {/* การ์ดรายการงาน */}
        <div className="card task-list-card">
          <div className="card-header flex-between">
            <div className="card-header-title">
              <FolderKanban size={20} className="icon-blue" />
              <h3>รายการงานที่ได้รับมอบหมาย</h3>
              <span className="permission-pill employee">เฉพาะงานของฉัน</span>
            </div>

            {/* ตัวกรองสถานะ Filter */}
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
              <Loader2 className="spinner" size={32} />
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
                    <th style={{ width: '130px' }}>สถานะ</th>
                    <th style={{ width: '180px' }}>วันที่สร้าง</th>
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
                            className={`status-badge ${isDone ? 'status-done' : 'status-todo'}`}
                          >
                            {isDone ? '✓ Done' : '⏳ To Do'}
                          </span>
                        </td>
                        <td className="date-cell">{task.created_at}</td>
                        <td style={{ textAlign: 'center' }}>
                          {isDone ? (
                            <div className="locked-done-badge" title="งานเสร็จสิ้นแล้ว ไม่สามารถย้อนกลับได้ตามกฎระบบ">
                              <Lock size={14} />
                              <span>เสร็จสิ้น (ล็อก)</span>
                            </div>
                          ) : (
                            <button
                              id={`mark-done-btn-${task.id}`}
                              onClick={() => handleMarkDone(task)}
                              disabled={isUpdating}
                              className="btn-mark-done"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 size={14} className="spinner" />
                                  <span>กำลังอัปเดต...</span>
                                </>
                              ) : (
                                <>
                                  <Check size={14} />
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
