-- EduWeave v2.0 PostgreSQL Database Schema (Supabase)
-- AI-Powered Academic Coordination & Anti-Burnout Platform

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unique_id VARCHAR(32) UNIQUE NOT NULL, -- STU-XXXX, TCH-XXXX, HOD-XXXX, ADM-XXXX
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'hod', 'teacher', 'student')),
    full_name VARCHAR(255) NOT NULL,
    department_id UUID,
    avatar_url TEXT,
    skills TEXT[], -- Bio skills for student volunteer sourcing
    bio TEXT,
    must_change_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(32) NOT NULL UNIQUE,
    hod_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foreign key link for users.department_id
ALTER TABLE users 
ADD CONSTRAINT fk_user_department 
FOREIGN KEY (department_id) 
REFERENCES departments(id) 
ON DELETE SET NULL;

-- 4. CLASSES & SECTIONS TABLE
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- e.g. "Grade 10 Biology", "Grade 11 AP Physics"
    section VARCHAR(32) NOT NULL, -- e.g. "Section A", "Section B"
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    room_number VARCHAR(64),
    term VARCHAR(64) DEFAULT 'Fall 2026',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CLASS ENROLLMENTS TABLE
CREATE TABLE IF NOT EXISTS class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, class_id)
);

-- 6. SYLLABI & NOTES KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS syllabi_and_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    topic_name VARCHAR(255) NOT NULL,
    unit_number VARCHAR(64) NOT NULL, -- e.g. "Unit 3.2"
    key_concepts TEXT[] DEFAULT '{}',
    content_text TEXT NOT NULL,
    textbook_reference TEXT,
    teacher_notes_snippets TEXT,
    file_url TEXT,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    topic_tag VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority_level VARCHAR(32) NOT NULL CHECK (priority_level IN ('low', 'medium', 'high')),
    estimated_hours NUMERIC(4,2) NOT NULL DEFAULT 2.0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SUB-TASKS (GEMINI AUTO-DIVIDED MILESTONES)
CREATE TABLE IF NOT EXISTS sub_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    step_number INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. STUDENT DIAGNOSTICS (STRESS BASELINE MODEL)
CREATE TABLE IF NOT EXISTS student_diagnostics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    proficiency_score INT NOT NULL CHECK (proficiency_score BETWEEN 1 AND 5),
    pace_rating VARCHAR(64) DEFAULT 'balanced', -- rapid, balanced, methodical
    peak_focus_hours VARCHAR(64) DEFAULT 'evening', -- morning, afternoon, evening, night
    preferred_session_minutes INT DEFAULT 45,
    extracurricular_hours_per_week NUMERIC(4,1) DEFAULT 6.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, subject_name)
);

-- 10. INSTITUTIONAL EVENTS & CALENDAR
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(64) NOT NULL CHECK (event_type IN ('exam', 'event', 'holiday', 'meeting', 'workshop', 'personal')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    target_role VARCHAR(64) DEFAULT 'all',
    lead_teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. PROJECT COLLABORATION GROUPS & KANBAN TASKS
CREATE TABLE IF NOT EXISTS project_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES project_groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(group_id, student_id)
);

CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES project_groups(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_unique_id ON users(unique_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_syllabi_class ON syllabi_and_notes(class_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_student ON sub_tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_student ON student_diagnostics(student_id);
