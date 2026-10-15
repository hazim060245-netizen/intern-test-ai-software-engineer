import { INITIAL_USERS, INITIAL_TASKS } from './mockData';

// Simulated in-memory storage (persists during page session)
let tasks = [...INITIAL_TASKS];
const users = [...INITIAL_USERS];

const LATENCY_MS = 500;

export const api = {
  /**
   * จำลองการ Login ด้วย Promise + setTimeout
   * ตรวจสอบว่ามี username ใน mock data หรือไม่
   */
  login: (username) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const trimmed = (username || '').trim().toLowerCase();
        const found = users.find((u) => u.username.toLowerCase() === trimmed);

        if (!found) {
          return reject(
            new Error(
              `ไม่พบบัญชี "${username}" ในระบบ (ลองใช้: admin, employee1, employee2)`
            )
          );
        }

        // คืนข้อมูล User พร้อม Token จำลอง
        resolve({
          user: { ...found },
          token: `mock-jwt-token-${found.role}-${found.id}-${Date.now()}`
        });
      }, LATENCY_MS);
    });
  },

  /**
   * ดึงรายชื่อพนักงานทั้งหมด (สำหรับให้ Admin เลือกมอบหมาย Task)
   */
  getEmployees: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const employees = users.filter((u) => u.role === 'employee');
        resolve({ employees });
      }, LATENCY_MS / 2);
    });
  },

  /**
   * ดึงรายการ Tasks ตามสิทธิ์ของผู้ใช้
   * - Admin: เห็นทั้งหมด
   * - Employee: API ส่งเฉพาะ task ของตนเอง
   */
  getTasks: (currentUser) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser) {
          return reject(new Error('กรุณาเข้าสู่ระบบก่อนเข้าถึงข้อมูล'));
        }

        if (currentUser.role === 'admin') {
          resolve({ tasks: [...tasks] });
        } else {
          const userTasks = tasks.filter((t) => t.assigned_to === currentUser.id);
          resolve({ tasks: [...userTasks] });
        }
      }, LATENCY_MS);
    });
  },

  /**
   * Admin สร้าง Task ใหม่
   */
  createTask: ({ title, assigned_to }, currentUser) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser || currentUser.role !== 'admin') {
          return reject(new Error('ข้อผิดพลาด: เฉพาะ Admin เท่านั้นที่สามารถสร้าง Task ได้'));
        }

        if (!title || !title.trim()) {
          return reject(new Error('กรุณากรอกชื่อ Task'));
        }

        if (!assigned_to) {
          return reject(new Error('กรุณาเลือกผู้รับผิดชอบ'));
        }

        const newTask = {
          id: Date.now(),
          title: title.trim(),
          assigned_to: Number(assigned_to),
          status: 'To Do',
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        // เพิ่ม Task ใหม่ไว้ด้านบนสุด
        tasks = [newTask, ...tasks];
        resolve({ task: newTask });
      }, LATENCY_MS);
    });
  },

  /**
   * อัปเดตสถานะของ Task
   * กฎของระบบ:
   * 1. Admin: เปลี่ยน Task ไหนก็ได้ และเปลี่ยนสถานะใดก็ได้
   * 2. Employee: เปลี่ยนได้เฉพาะ Task ของตนเอง และเปลี่ยนได้เฉพาะ To Do -> Done เท่านั้น (ห้ามย้อนกลับ)
   */
  updateTaskStatus: (taskId, newStatus, currentUser) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!currentUser) {
          return reject(new Error('กรุณาเข้าสู่ระบบก่อนดำเนินการ'));
        }

        const taskIndex = tasks.findIndex((t) => t.id === Number(taskId));
        if (taskIndex === -1) {
          return reject(new Error('ไม่พบ Task ที่ระบุในระบบ'));
        }

        const task = tasks[taskIndex];
        const isAdmin = currentUser.role === 'admin';
        const isOwner = task.assigned_to === currentUser.id;

        // ตรวจสอบสิทธิ์การเป็นเจ้าของ
        if (!isAdmin && !isOwner) {
          return reject(new Error('คุณไม่มีสิทธิ์เปลี่ยนสถานะ Task ที่ไม่ใช่ของตนเอง'));
        }

        // ตรวจสอบกฎการย้อนสถานะของ Employee
        if (!isAdmin && task.status === 'Done' && newStatus === 'To Do') {
          return reject(new Error('ไม่อนุญาตให้เปลี่ยน Task ที่เสร็จสิ้น (Done) กลับเป็น To Do'));
        }

        // ตรวจสอบการเปลี่ยนสถานะของ Employee ให้ทำได้เฉพาะ To Do -> Done
        if (!isAdmin && newStatus !== 'Done') {
          return reject(new Error('Employee สามารถเปลี่ยนสถานะได้เฉพาะเป็น Done เท่านั้น'));
        }

        // อัปเดตสถานะ
        const updatedTask = {
          ...task,
          status: newStatus,
          updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        tasks[taskIndex] = updatedTask;
        resolve({ task: updatedTask });
      }, LATENCY_MS);
    });
  }
};
