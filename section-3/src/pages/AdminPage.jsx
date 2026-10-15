import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../mock/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  Clock3,
  User,
  ListTodo,
  Loader2,
  AlertCircle,
  RefreshCw,
  FolderGit2,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const loadData = async () => {
    setLoadingTasks(true);
    setErrorMessage('');
    try {
      const [tasksRes, empsRes] = await Promise.all([
        api.getTasks(user),
        api.getEmployees()
      ]);
      setTasks(tasksRes.tasks);
      setEmployees(empsRes.employees);
      if (empsRes.employees.length > 0 && !selectedAssignee) {
        setSelectedAssignee(empsRes.employees[0].id.toString());
      }
    } catch (err) {
      setErrorMessage(err.message || 'ไม่สามารถโหลดข้อมูล Task ได้');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setErrorMessage('กรุณาระบุชื่อ Task');
      return;
    }

    setCreating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await api.createTask(
        { title: newTaskTitle, assigned_to: selectedAssignee },
        user
      );

      setTasks((prev) => [result.task, ...prev]);
      setNewTaskTitle('');
      setSuccessMessage(`สร้าง Task "${result.task.title}" สำเร็จเรียบร้อย!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการสร้าง Task');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Done' ? 'To Do' : 'Done';
    setUpdatingTaskId(task.id);
    setErrorMessage('');

    try {
      const result = await api.updateTaskStatus(task.id, nextStatus, user);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? result.task : t))
      );
    } catch (err) {
      setErrorMessage(err.message || 'ไม่สามารถเปลี่ยนสถานะได้');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getAssignee = (assignedToId) => {
    return employees.find((e) => e.id === assignedToId);
  };

  const todoCount = tasks.filter((t) => t.status === 'To Do').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="page-header-banner">
          <div>
            <div className="section-pill-tag">
              <span>PAWTRY MANAGEMENT CONSOLE</span>
            </div>
            <h2 className="page-title">แดชบอร์ดผู้ดูแลระบบ (Admin Portal)</h2>
            <p className="page-subtitle">
              จัดการโครงการ, สร้างภารกิจใหม่, และมอบหมายงานให้พนักงานทุกคนในเครือข่าย Pawtry Thailand
            </p>
          </div>

          <button
            onClick={loadData}
            className="btn-refresh"
            disabled={loadingTasks}
            title="รีเฟรชข้อมูลล่าสุด"
          >
            <RefreshCw size={16} className={loadingTasks ? 'spinner' : ''} />
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
              <ListTodo size={26} />
            </div>
            <div className="strip-content">
              <span className="strip-value">{tasks.length} งาน</span>
              <span className="strip-label">ภารกิจทั้งหมดในระบบ</span>
            </div>
          </div>

          <div className="stats-divider"></div>

          <div className="stats-strip-item">
            <div className="strip-icon-box">
              <Clock size={26} />
            </div>
            <div className="strip-content">
              <span className="strip-value">{todoCount} งาน</span>
              <span className="strip-label">กำลังดำเนินการ (To Do)</span>
            </div>
          </div>

          <div className="stats-divider"></div>

          <div className="stats-strip-item">
            <div className="strip-icon-box">
              <CheckCircle2 size={26} />
            </div>
            <div className="strip-content">
              <span className="strip-value">{doneCount} งาน</span>
              <span className="strip-label">ส่งมอบสำเร็จแล้ว (Done)</span>
            </div>
          </div>

          <div className="stats-divider"></div>

          <div className="stats-strip-item">
            <div className="strip-icon-box">
              <ShieldCheck size={26} />
            </div>
            <div className="strip-content">
              <span className="strip-value">100% Secure</span>
              <span className="strip-label">Access Control Rule</span>
            </div>
          </div>
        </div>

        {/* ฟอร์มสร้าง Task ใหม่ */}
        <div className="pawtry-card create-task-card">
          <div className="card-header">
            <div className="card-header-title">
              <PlusCircle size={22} className="icon-pawtry-orange" />
              <h3>สร้าง Task ใหม่ (มอบหมายงาน)</h3>
            </div>
            <span className="permission-pill admin">สิทธิ์: Admin เท่านั้น</span>
          </div>

          <form onSubmit={handleCreateTask} className="create-task-form">
            <div className="form-row">
              <div className="form-group flex-2">
                <label htmlFor="task-title-input">ชื่องาน / รายละเอียดโครงการ</label>
                <input
                  id="task-title-input"
                  type="text"
                  placeholder="เช่น ตรวจสอบสูตรอาหารสัตว์เลี้ยง OEM ล็อตใหม่..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  disabled={creating}
                  className="form-input"
                />
              </div>

              <div className="form-group flex-1">
                <label htmlFor="assignee-select">มอบหมายให้พนักงาน</label>
                <select
                  id="assignee-select"
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  disabled={creating}
                  className="form-select"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group form-submit-col">
                <button
                  type="submit"
                  id="create-task-button"
                  className="btn-pawtry-orange"
                  disabled={creating || !newTaskTitle.trim()}
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={18} />
                      <span>สร้าง Task</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ตารางแสดง Task ทั้งหมด */}
        <div className="pawtry-card task-list-card">
          <div className="card-header">
            <div className="card-header-title">
              <FolderGit2 size={22} className="icon-pawtry-navy" />
              <h3>รายการภารกิจทั้งหมดในโครงการ</h3>
            </div>
            <span className="count-pill">{tasks.length} ภารกิจ</span>
          </div>

          {loadingTasks ? (
            <div className="loading-state">
              <Loader2 className="spinner" size={36} />
              <p>กำลังดึงข้อมูลภารกิจผ่าน Mock API...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <p>ยังไม่มี Task ในระบบ คลิกสร้าง Task ด้านบนได้เลย</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="task-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>ชื่องาน (Task Title)</th>
                    <th style={{ width: '240px' }}>ผู้รับผิดชอบ</th>
                    <th style={{ width: '150px' }}>สถานะ</th>
                    <th style={{ width: '180px' }}>วันที่สร้าง</th>
                    <th style={{ width: '170px', textAlign: 'center' }}>การจัดการ (Admin)</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const isUpdating = updatingTaskId === task.id;
                    const isDone = task.status === 'Done';
                    const emp = getAssignee(task.assigned_to);

                    return (
                      <tr key={task.id} className={isDone ? 'row-done' : ''}>
                        <td className="task-id">#{task.id}</td>
                        <td className="task-title-cell">
                          <span className={`task-title-text ${isDone ? 'done-text' : ''}`}>
                            {task.title}
                          </span>
                        </td>
                        <td>
                          <div className="assignee-badge">
                            <div
                              className="assignee-mini-avatar"
                              style={{ background: emp?.avatarBg || '#182b52' }}
                            >
                              {emp?.initials || 'U'}
                            </div>
                            <span className="assignee-text">
                              {emp ? emp.name : `#${task.assigned_to}`}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge-pawtry ${isDone ? 'status-done' : 'status-todo'}`}>
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
                          <button
                            onClick={() => handleToggleStatus(task)}
                            disabled={isUpdating}
                            className={`btn-action-pill ${isDone ? 'btn-reopen' : 'btn-mark-done'}`}
                            title={isDone ? 'Admin สามารถเปลี่ยนกลับเป็น To Do ได้' : 'เปลี่ยนสถานะเป็น Done'}
                          >
                            {isUpdating ? (
                              <Loader2 size={14} className="spinner" />
                            ) : isDone ? (
                              <>
                                <RotateCcw size={13} />
                                <span>ย้อนเป็น To Do</span>
                              </>
                            ) : (
                              <>
                                <Check size={14} />
                                <span>เปลี่ยนเป็น Done</span>
                              </>
                            )}
                          </button>
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
