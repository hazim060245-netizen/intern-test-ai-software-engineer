const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const ALLOWED_STATUSES = ['To Do', 'Done'];
const PAGE_SIZE = 20;

// GET /api/tasks - ดูรายการ task (ทุกคนที่ login)
router.get('/api/tasks', authenticate, async (req, res) => {
  const { projectId, page = 1 } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  try {
    let sql = 'SELECT * FROM tasks';
    const params = [];
    const conditions = [];

    // กรองตาม projectId ถ้ามีการระบุ
    if (projectId) {
      params.push(projectId);
      conditions.push(`project_id = $${params.length}`);
    }

    // ถ้าไม่ใช่ admin ให้เห็นเฉพาะ task ที่ตนเองได้รับมอบหมาย
    // แก้ไข: ใช้ Parameterized query เพื่อป้องกัน SQL Injection และแก้ Syntax Error
    if (req.user.role !== 'admin') {
      params.push(req.user.id);
      conditions.push(`assigned_to = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    params.push(PAGE_SIZE);
    const limitParamIndex = params.length;
    params.push(offset);
    const offsetParamIndex = params.length;

    sql += ` ORDER BY created_at DESC LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`;

    const result = await db.query(sql, params);
    return res.status(200).json({ tasks: result.rows, page: pageNum });
  } catch (err) {
    console.error('GET /api/tasks failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/tasks/:id/status - เปลี่ยนสถานะ { "status": "Done" }
router.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  const taskId = Number(req.params.id);
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = rows[0];
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = task.assigned_to === req.user.id;

    // แก้ไข: เปลี่ยนจาก (!isAdmin || !isOwner) เป็น (!isAdmin && !isOwner)
    // เพื่อให้ Admin แก้ของใครก็ได้ และ Employee แก้ของตนเองได้
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No permission to edit this task' });
    }

    // กฎ: Employee ห้ามย้อนจาก Done กลับเป็น To Do และเปลี่ยนได้เฉพาะเป็น Done เท่านั้น
    if (!isAdmin && task.status === 'Done' && status === 'To Do') {
      return res.status(409).json({ message: 'Cannot reopen a finished task' });
    }

    if (!isAdmin && status !== 'Done') {
      return res.status(400).json({ message: 'Employee can only change status to Done' });
    }

    // อัปเดตสถานะ Task
    const updateResult = await db.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, taskId]
    );

    // แก้ไข: เพิ่ม await เพื่อให้บันทึก audit_log สำเร็จก่อนตอบกลับ 200 ตามสเปค
    await db.query(
      'INSERT INTO audit_log (task_id, user_id, action) VALUES ($1, $2, $3)',
      [taskId, req.user.id, `status:${status}`]
    );

    const updatedTask = updateResult.rows[0] || { ...task, status };
    return res.status(200).json({ task: updatedTask });
  } catch (err) {
    console.error('PATCH /api/tasks/:id/status failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/tasks/:id - ลบ task (Admin เท่านั้น)
// แก้ไข: เพิ่ม middleware `authenticate` เพื่อป้องกันผู้ไม่ล็อกอินเข้าถึงและลบข้อมูล
router.delete('/api/tasks/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }

  const taskId = Number(req.params.id);
  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
  return res.status(204).end();
});

module.exports = router;
