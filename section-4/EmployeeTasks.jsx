import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function EmployeeTasks() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. ดึงข้อมูลครั้งแรกเมื่อ Component Mount หรือ Token เปลี่ยน
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    api.getTasks(token)
      .then((data) => {
        if (isMounted) {
          setTasks(data.tasks);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'ไม่สามารถดึงข้อมูล Task ได้');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  // 2. ดึงข้อมูลอัตโนมัติทุก 10 วินาที และมี Cleanup Function เพื่อหยุด Polling เมื่อออกจากหน้า
  useEffect(() => {
    const timer = setInterval(() => {
      api.getTasks(token)
        .then((data) => {
          setTasks(data.tasks);
        })
        .catch((err) => {
          console.error('Polling tasks failed:', err);
        });
    }, 10000);

    // Cleanup: หยุดการทำงานของ Timer ทันทีเมื่อ Component Unmount หรือออกจากหน้านี้
    return () => {
      clearInterval(timer);
    };
  }, [token]);

  // กรองเฉพาะงานของพนักงานคนนี้ และกรองตามสถานะ
  const visible = tasks.filter(
    (t) => t.assigned_to === user.id && (filter === 'All' || t.status === filter)
  );

  // 3. จัดการการเปลี่ยนสถานะแบบ Optimistic Update พร้อม Rollback เมื่อ Server ล้มเหลว
  const markDone = async (task) => {
    setError('');
    const previousTasks = [...tasks];

    // Optimistic Update: เปลี่ยน UI ทันทีอย่างถูกต้องแบบ Immutable
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'Done' } : t))
    );

    try {
      const updated = await api.updateStatus(token, task.id, 'Done');
      // ยืนยันข้อมูลด้วยผลลัพธ์ที่ Server บันทึกจริง
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated : t))
      );
    } catch (e) {
      // Rollback: หาก Server ล้มเหลว ให้คืนค่าสถานะเดิมบนหน้าจอทันที
      setTasks(previousTasks);
      setError('อัปเดตไม่สำเร็จ: ' + (e.message || 'Server เกิดข้อผิดพลาด'));
    }
  };

  return (
    <div className="page">
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option>All</option>
        <option>To Do</option>
        <option>Done</option>
      </select>

      {loading && <p>กำลังโหลด...</p>}
      {error && <p className="error">{error}</p>}

      <ul>
        {visible.map((t) => (
          // ใช้ t.id เป็น key แทน index (i) เพื่อความเสถียรของ Virtual DOM
          <li key={t.id}>
            {t.title} — {t.status}
            {t.status !== 'Done' && (
              <button onClick={() => markDone(t)}>เปลี่ยนเป็น Done</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
