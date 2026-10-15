-- ==============================================================================
-- DATABASE SCHEMA: Project Access Control System
-- PostgreSQL 15+ Compatible
-- ==============================================================================

-- 1. Create Enum Types สำหรับ Role และ Task Status เพื่อความเสถียรและจำกัดค่าที่อนุญาต
CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE task_status AS ENUM ('To Do', 'Done');

-- ==============================================================================
-- Table: users
-- ตารางเก็บข้อมูลผู้ใช้และบทบาท (Role) สำหรับ Access Control
-- ==============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index สำหรับค้นหาผู้ใช้ตอน Authentication / Login
CREATE INDEX idx_users_username ON users (username);


-- ==============================================================================
-- Table: projects
-- ตารางโครงการ (Admin เป็นผู้สร้าง)
-- ==============================================================================
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key ไปยังผู้สร้างโครงการ (ต้องเป็น Admin)
    CONSTRAINT fk_projects_created_by FOREIGN KEY (created_by)
        REFERENCES users (id) ON DELETE RESTRICT
);

-- Index สำหรับดึงรายการโครงการที่สร้างโดย user
CREATE INDEX idx_projects_created_by ON projects (created_by);


-- ==============================================================================
-- Table: tasks
-- ตารางงานในโครงการ พร้อมสิทธิ์การมอบหมายและสถานะ
-- ==============================================================================
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to INTEGER NOT NULL,
    status task_status NOT NULL DEFAULT 'To Do',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Key ไปยังโครงการ
    CONSTRAINT fk_tasks_project FOREIGN KEY (project_id)
        REFERENCES projects (id) ON DELETE CASCADE,

    -- Foreign Key ไปยังพนักงานผู้รับผิดชอบ
    CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to)
        REFERENCES users (id) ON DELETE RESTRICT,

    -- Constraint รับประกันค่าของ status ต้องเป็น To Do หรือ Done เท่านั้น
    CONSTRAINT chk_task_status CHECK (status IN ('To Do', 'Done'))
);

-- Index 1: รองรับ Query ของ Employee (ดึงเฉพาะงานของตนเอง เรียงตามเวลาล่าสุด)
-- Query: SELECT * FROM tasks WHERE assigned_to = $1 ORDER BY created_at DESC
CREATE INDEX idx_tasks_assigned_to_created_at ON tasks (assigned_to, created_at DESC);

-- Index 2: รองรับ Query ของ Admin และการกรองตาม Project + Pagination
-- Query: SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3
CREATE INDEX idx_tasks_project_id_created_at ON tasks (project_id, created_at DESC);

-- Index 3: รองรับการกรองตามสถานะ (เช่น กรองดูเฉพาะ To Do หรือ Done)
-- Query: SELECT * FROM tasks WHERE assigned_to = $1 AND status = $2
CREATE INDEX idx_tasks_assigned_status ON tasks (assigned_to, status);


-- ==============================================================================
-- Table: audit_log
-- ตารางประวัติการแก้ไขสถานะตามข้อกำหนดความปลอดภัย (Audit Trail)
-- ==============================================================================
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_task FOREIGN KEY (task_id)
        REFERENCES tasks (id) ON DELETE CASCADE,

    CONSTRAINT fk_audit_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT
);

-- Index สำหรับค้นหา Audit Log ย้อนหลังตาม Task หรือ User
CREATE INDEX idx_audit_log_task_id ON audit_log (task_id, created_at DESC);
CREATE INDEX idx_audit_log_user_id ON audit_log (user_id, created_at DESC);
