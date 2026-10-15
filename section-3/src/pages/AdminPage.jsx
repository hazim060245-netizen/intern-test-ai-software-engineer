import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../mock/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  CheckCircle2,
  Clock,
  User,
  ListTodo,
  Loader2,
  AlertCircle,
  RefreshCw,
  FolderGit2
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

  // Form State สำหรับสร้าง Task
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // โหลดข้อมูล Task และพนักงานทั้งหมด
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

  // สร้าง Task ใหม่
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

      // อัปเดตรายการทันที (Optimistic/Direct State Update)
      setTasks((prev) => [result.task, ...prev]);
      setNewTaskTitle('');
      setSuccessMessage(`สร้าง Task "${result.task.title}" สำเร็จเรียบร้อย!`);

      // ซ่อนข้อความแจ้งเตือนความสำเร็จหลัง 3 วินาที
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการสร้าง Task');
    } finally {
      setCreating(false);
    }
  };

  // Admin เปลี่ยนสถานะ Task (สามารถเปลี่ยนได้ทั้ง To Do และ Done)
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

  const getAssigneeName = (assignedToId) => {
    const emp = employees.find((e) => e.id === assignedToId);
    return emp ? `${emp.name} (${emp.username})` : `พนักงานรหัส #${assignedToId}`;
  };

  const todoCount = tasks.filter((t) => t.status === 'To Do').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">แดชบอร์ดผู้ดูแลระบบ (Admin Dashboard)</h2>
            <p className="page-subtitle">
              จัดการโครงการ, สร้าง Task ใหม่, และมอบหมายงานให้พนักงานทั้งหมด
            </p>
          </div>

          <button
            onClick={loadData}
            className="btn-secondary"
            disabled={loadingTasks}
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={16} className={loadingTasks ? 'spinner' : ''} />
            <span>รีเฟรช</span>
          </button>
        </div>

        {/* ข้อความแจ้งเตือนสถานะการทำงาน */}
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

        {/* สรุปตัวเลขสถิติภาพรวม */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">
              <ListTodo size={22} />
            </div>
            <div className="stat-data">
              <span className="stat-value">{tasks.length}</span>
              <span className="stat-label">Tasks ทั้งหมดในระบบ</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper amber">
              <Clock size={22} />
            </div>
            <div className="stat-data">
              <span className="stat-value">{todoCount}</span>
              <span className="stat-label">รอดำเนินการ (To Do)</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper green">
              <CheckCircle2 size={22} />
            </div>
            <div className="stat-data">
              <span className="stat-value">{doneCount}</span>
              <span className="stat-label">เสร็จสิ้นแล้ว (Done)</span>
            </div>
          </div>
        </div>

        {/* ส่วนที่ 1: ฟอร์มสร้าง Task ใหม่ */}
        <div className="card create-task-card">
          <div className="card-header">
            <div className="card-header-title">
              <PlusCircle size={20} className="icon-blue" />
              <h3>สร้าง Task ใหม่ (มอบหมายงาน)</h3>
            </div>
            <span className="permission-pill admin">สิทธิ์: Admin เท่านั้น</span>
          </div>

          <form onSubmit={handleCreateTask} className="create-task-form">
            <div className="form-row">
              <div className="form-group flex-2">
                <label htmlFor="task-title-input">ชื่อ Task / รายละเอียดงาน</label>
                <input
                  id="task-title-input"
                  type="text"
                  placeholder="เช่น ตรวจสอบความถูกต้องของ Business Logic..."
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
                  className="btn-primary"
                  disabled={creating || !newTaskTitle.trim()}
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} />
                      <span>สร้าง Task</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ส่วนที่ 2: รายการ Task ทั้งหมดในระบบ */}
        <div className="card task-list-card">
          <div className="card-header">
            <div className="card-header-title">
              <FolderGit2 size={20} className="icon-purple" />
              <h3>รายการ Task ทั้งหมดในโครงการ</h3>
            </div>
            <span className="task-count-tag">{tasks.length} รายการ</span>
          </div>

          {loadingTasks ? (
            <div className="loading-state">
              <Loader2 className="spinner" size={32} />
              <p>กำลังดึงข้อมูล Tasks ผ่าน Mock API...</p>
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
                    <th style={{ width: '220px' }}>ผู้รับผิดชอบ</th>
                    <th style={{ width: '130px' }}>สถานะ</th>
                    <th style={{ width: '170px' }}>สร้างเมื่อ</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>การจัดการ (Admin)</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
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
                          <div className="assignee-badge">
                            <User size={14} />
                            <span>{getAssigneeName(task.assigned_to)}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${isDone ? 'status-done' : 'status-todo'}`}>
                            {isDone ? '✓ Done' : '⏳ To Do'}
                          </span>
                        </td>
                        <td className="date-cell">{task.created_at}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleToggleStatus(task)}
                            disabled={isUpdating}
                            className={`btn-action ${isDone ? 'btn-reopen' : 'btn-mark-done'}`}
                            title={isDone ? 'Admin สามารถเปลี่ยนกลับเป็น To Do ได้' : 'เปลี่ยนสถานะเป็น Done'}
                          >
                            {isUpdating ? (
                              <Loader2 size={14} className="spinner" />
                            ) : isDone ? (
                              'ย้อนเป็น To Do'
                            ) : (
                              'เปลี่ยนเป็น Done'
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
