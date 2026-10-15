// Mock Data for Section 3
export const INITIAL_USERS = [
  {
    id: 1,
    username: 'admin',
    name: 'Somkiat Admin',
    role: 'admin',
    avatar: '👨‍💼',
    department: 'Management'
  },
  {
    id: 2,
    username: 'employee1',
    name: 'Somchai Prasert',
    role: 'employee',
    avatar: '👨‍💻',
    department: 'Software Engineering'
  },
  {
    id: 3,
    username: 'employee2',
    name: 'Somsri Sukjai',
    role: 'employee',
    avatar: '👩‍💻',
    department: 'Quality Assurance'
  }
];

export const INITIAL_TASKS = [
  {
    id: 101,
    title: 'ออกแบบ Flowchart สิทธิ์การเข้าถึง Project Access Control',
    assigned_to: 2,
    status: 'To Do',
    created_at: '2026-10-15 09:30:00'
  },
  {
    id: 102,
    title: 'ติดตั้ง PostgreSQL Schema และ Index ใน Section 2',
    assigned_to: 2,
    status: 'Done',
    created_at: '2026-10-15 10:15:00'
  },
  {
    id: 103,
    title: 'พัฒนาระบบ Route Guard และ Context API ใน React',
    assigned_to: 3,
    status: 'To Do',
    created_at: '2026-10-15 11:00:00'
  },
  {
    id: 104,
    title: 'เขียน Unit Test จำลองการเปลี่ยนสถานะ To Do -> Done',
    assigned_to: 3,
    status: 'Done',
    created_at: '2026-10-15 11:45:00'
  },
  {
    id: 105,
    title: 'ตรวจสอบช่องโหว่ความปลอดภัย SQL Injection & Auth BUGS',
    assigned_to: 2,
    status: 'To Do',
    created_at: '2026-10-15 13:10:00'
  },
  {
    id: 106,
    title: 'ทำ UI Responsive Dashboard สำหรับ Admin และ Employee',
    assigned_to: 3,
    status: 'To Do',
    created_at: '2026-10-15 13:40:00'
  }
];
