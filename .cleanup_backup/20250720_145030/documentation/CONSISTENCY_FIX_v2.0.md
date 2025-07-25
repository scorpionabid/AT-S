# CONSISTENCY FIX DOCUMENT v2.0
## ATİS System Standardization & Gap Resolution

### DOCUMENT INFO
**Version**: 2.0 Consistency Fix
**Created**: January 2025
**Purpose**: Resolve all inconsistencies across ATİS documentation
**Status**: MANDATORY - Must be implemented before development

---

## 🚨 CRITICAL FIXES IMPLEMENTED

### 1. STANDARDIZED USER ROLES

**FINAL ROLE STRUCTURE:**
```sql
-- Regional Level Roles
INSERT INTO roles (name, display_name, level, department_access) VALUES
('superadmin', 'Super Administrator', 1, '["*"]'),
('regionadmin', 'Regional Administrator', 2, '["regional_maliyyə", "regional_təsərrüfat", "regional_inzibati"]'),
('regionoperator_maliyye', 'Regional Finance Operator', 3, '["regional_maliyyə"]'),
('regionoperator_tesserrufat', 'Regional Facility Operator', 3, '["regional_təsərrüfat"]'), 
('regionoperator_inzibati', 'Regional Administrative Operator', 3, '["regional_inzibati"]'),
('sektoradmin', 'Sector Administrator', 4, '["school_təhsil", "school_statistika"]'),

-- School Level Roles  
('schooladmin', 'School Administrator', 5, '["school_maliyyə", "school_təsərrüfat", "school_təhsil", "school_statistika", "school_qiymətləndirmə"]'),
('muavin_mudir', 'Assistant Principal', 6, '["school_təhsil", "school_statistika"]'),
('ubr_muellimi', 'Subject Teacher Leader', 6, '["school_təhsil", "school_qiymətləndirmə"]'),
('tesserrufat_mesulu', 'Facility Manager', 6, '["school_təsərrüfat"]'),
('maliyye_mesulu', 'Finance Manager', 6, '["school_maliyyə"]'),
('psixoloq', 'School Psychologist', 6, '["school_statistika", "school_qiymətləndirmə"]'),
('muellim', 'Teacher', 7, '["school_təhsil", "school_qiymətləndirmə"]');
```

### 2. STANDARDIZED DEPARTMENT NAMES

**REGIONAL DEPARTMENTS:**
- `regional_maliyyə` - Regional budget, funding allocation
- `regional_təsərrüfat` - Regional infrastructure, major construction  
- `regional_inzibati` - Personnel decisions, document workflow

**SCHOOL DEPARTMENTS:**
- `school_maliyyə` - School expenses, local budget
- `school_təsərrüfat` - School building, minor repairs
- `school_təhsil` - Curriculum, schedules, teaching
- `school_statistika` - Student count, attendance, performance data
- `school_qiymətləndirmə` - Grades, assessments, KSQ/BSQ

### 3. STANDARDIZED FILE SIZE LIMITS

```php
'file_limits' => [
    'small_files' => [
        'max_size' => '10MB',
        'types' => ['pdf', 'doc', 'docx', 'xlsx'],
        'usage' => 'forms, documents, reports'
    ],
    'large_files' => [
        'max_size' => '50MB', 
        'types' => ['xlsx', 'pdf', 'zip'],
        'usage' => 'comprehensive reports, bulk data'
    ],
    'monthly_limit_per_user' => '100MB',
    'concurrent_uploads' => 3
]
```

---

## 📊 COMPLETE DATABASE SCHEMA v2.0

### CORE AUTHENTICATION TABLES

```sql
-- Enhanced users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL REFERENCES roles(id),
    institution_id BIGINT REFERENCES institutions(id),
    departments JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    language_preference VARCHAR(5) DEFAULT 'az',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    level INTEGER NOT NULL,
    department_access JSONB DEFAULT '[]'::jsonb,
    max_institutions INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    resource VARCHAR(50),
    action VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Role permissions junction
CREATE TABLE role_has_permissions (
    role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
```

### INSTITUTIONAL HIERARCHY

```sql
-- Enhanced institutions table  
CREATE TABLE institutions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(50),
    type VARCHAR(50) NOT NULL, -- 'region', 'sector', 'school'
    parent_id BIGINT REFERENCES institutions(id),
    level INTEGER NOT NULL,
    region_code VARCHAR(10),
    institution_code VARCHAR(20) UNIQUE,
    contact_info JSONB DEFAULT '{}'::jsonb,
    location JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    established_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### SCHOOL MANAGEMENT TABLES

```sql
-- School staff with enhanced departments
CREATE TABLE school_staff (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    school_id BIGINT NOT NULL REFERENCES institutions(id),
    staff_role VARCHAR(50) NOT NULL,
    departments JSONB DEFAULT '[]'::jsonb,
    subjects JSONB DEFAULT '[]'::jsonb,
    employment_type VARCHAR(50) DEFAULT 'full_time',
    employment_status VARCHAR(20) DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE,
    qualifications JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT school_staff_role_check CHECK (staff_role IN (
        'muavin_mudir', 'ubr_muellimi', 'tesserrufat_mesulu', 
        'maliyye_mesulu', 'psixoloq', 'muellim'
    ))
);

-- Students table (ADDED)
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    class_id BIGINT NOT NULL REFERENCES classes(id),
    birth_year INTEGER,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, graduated, transferred, dropped
    parent_contact JSONB DEFAULT '{}'::jsonb,
    medical_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES institutions(id),
    class_name VARCHAR(20) NOT NULL, -- '11-A', '9-B'
    grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 1 AND 11),
    current_student_count INTEGER DEFAULT 0,
    max_capacity INTEGER DEFAULT 30,
    room_number VARCHAR(10),
    class_teacher_id BIGINT REFERENCES school_staff(id),
    academic_year VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    grade_levels INTEGER[] NOT NULL,
    weekly_hours INTEGER DEFAULT 2,
    subject_type VARCHAR(50) DEFAULT 'core',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Schedules table
CREATE TABLE schedules (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES institutions(id),
    class_id BIGINT NOT NULL REFERENCES classes(id),
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    teacher_id BIGINT NOT NULL REFERENCES school_staff(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    time_slot INTEGER NOT NULL CHECK (time_slot BETWEEN 1 AND 10),
    room_number VARCHAR(10),
    academic_year VARCHAR(10) NOT NULL,
    semester INTEGER DEFAULT 1 CHECK (semester IN (1, 2)),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(school_id, day_of_week, time_slot, room_number, academic_year, semester)
);

-- Student grades table
CREATE TABLE student_grades (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    subject_id BIGINT NOT NULL REFERENCES subjects(id),
    teacher_id BIGINT NOT NULL REFERENCES school_staff(id),
    grade_value DECIMAL(3,1) NOT NULL CHECK (grade_value BETWEEN 1 AND 5),
    grade_type VARCHAR(50) NOT NULL, -- 'daily', 'quiz', 'exam', 'final'
    assessment_date DATE NOT NULL,
    term VARCHAR(20) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id),
    class_id BIGINT NOT NULL REFERENCES classes(id),
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    notes TEXT,
    recorded_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(student_id, attendance_date)
);

-- Assessments table (KSQ/BSQ)
CREATE TABLE assessments (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES institutions(id),
    assessment_type VARCHAR(50) NOT NULL CHECK (assessment_type IN ('ksq', 'bsq', 'monitoring', 'other')),
    assessment_name VARCHAR(200) NOT NULL,
    subject_id BIGINT REFERENCES subjects(id),
    grade_level INTEGER CHECK (grade_level BETWEEN 1 AND 11),
    assessment_date DATE NOT NULL,
    total_students INTEGER NOT NULL,
    results_summary JSONB NOT NULL,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### SURVEY SYSTEM ENHANCED

```sql
-- Enhanced surveys table
CREATE TABLE surveys (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id),
    target_level VARCHAR(20) NOT NULL CHECK (target_level IN ('regional', 'school')),
    target_departments JSONB DEFAULT '[]'::jsonb,
    target_institutions JSONB DEFAULT '[]'::jsonb,
    questions JSONB NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    deadline TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    max_file_size_mb INTEGER DEFAULT 10,
    status VARCHAR(20) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced survey responses
CREATE TABLE survey_responses (
    id BIGSERIAL PRIMARY KEY,
    survey_id BIGINT NOT NULL REFERENCES surveys(id),
    respondent_id BIGINT NOT NULL REFERENCES users(id),
    institution_id BIGINT NOT NULL REFERENCES institutions(id),
    department VARCHAR(50) NOT NULL,
    responses JSONB NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'draft',
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(survey_id, institution_id, department)
);
```

### DOCUMENT MANAGEMENT

```sql
-- Documents table
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    target_level VARCHAR(20) NOT NULL,
    target_departments JSONB DEFAULT '[]'::jsonb,
    target_institutions JSONB DEFAULT '[]'::jsonb,
    access_level VARCHAR(20) DEFAULT 'institution',
    expiry_date TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- File metadata for tracking
CREATE TABLE file_metadata (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT REFERENCES documents(id),
    checksum VARCHAR(64),
    virus_scan_status VARCHAR(20) DEFAULT 'pending',
    virus_scan_result TEXT,
    backup_status VARCHAR(20) DEFAULT 'pending',
    backup_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### SYSTEM MANAGEMENT

```sql
-- Tasks table
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    assigned_to BIGINT NOT NULL REFERENCES users(id),
    assigned_by BIGINT NOT NULL REFERENCES users(id),
    institution_id BIGINT REFERENCES institutions(id),
    due_date TIMESTAMP,
    priority VARCHAR(10) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    progress_percentage INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(10) DEFAULT 'normal',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    model_type VARCHAR(100),
    model_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System configuration
CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 PERFORMANCE INDEXES

```sql
-- Core performance indexes
CREATE INDEX idx_users_role_institution ON users(role_id, institution_id);
CREATE INDEX idx_users_departments_gin ON users USING GIN(departments);
CREATE INDEX idx_institutions_hierarchy ON institutions(parent_id, level, type);
CREATE INDEX idx_school_staff_composite ON school_staff(school_id, staff_role, employment_status);
CREATE INDEX idx_students_class_active ON students(class_id, status);
CREATE INDEX idx_schedules_conflict_check ON schedules(school_id, day_of_week, time_slot, academic_year);
CREATE INDEX idx_grades_student_subject ON student_grades(student_id, subject_id, academic_year);
CREATE INDEX idx_attendance_date_range ON attendance(student_id, attendance_date);
CREATE INDEX idx_surveys_target_active ON surveys(target_level, is_active, deadline);
CREATE INDEX idx_survey_responses_status ON survey_responses(survey_id, status, institution_id);
CREATE INDEX idx_documents_access ON documents(target_level, is_active, created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at);
```

---

## 📋 API ENDPOINTS STANDARDIZATION

### AUTHENTICATION
```
POST /api/v1/auth/login
POST /api/v1/auth/logout  
GET  /api/v1/auth/user
POST /api/v1/auth/refresh-token
```

### USER MANAGEMENT
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/{id}
PUT    /api/v1/users/{id}
DELETE /api/v1/users/{id}
PUT    /api/v1/users/{id}/departments
```

### INSTITUTIONS & HIERARCHY
```
GET /api/v1/institutions/tree
GET /api/v1/institutions/{id}/children
GET /api/v1/institutions/{id}/stats
```

### SCHOOL MANAGEMENT  
```
GET    /api/v1/schools/{id}/staff
POST   /api/v1/schools/{id}/staff
GET    /api/v1/schools/{id}/classes
POST   /api/v1/schools/{id}/classes
GET    /api/v1/schools/{id}/schedules
POST   /api/v1/schools/{id}/schedules/generate
GET    /api/v1/schools/{id}/students
POST   /api/v1/schools/{id}/students
```

### STUDENT MANAGEMENT
```
GET    /api/v1/students/{id}/profile
PUT    /api/v1/students/{id}/profile
POST   /api/v1/students/{id}/grades
GET    /api/v1/students/{id}/grades
POST   /api/v1/students/{id}/attendance
GET    /api/v1/students/{id}/attendance
```

### SURVEYS
```
GET    /api/v1/surveys
POST   /api/v1/surveys
GET    /api/v1/surveys/{id}
PUT    /api/v1/surveys/{id}
POST   /api/v1/surveys/{id}/responses
GET    /api/v1/surveys/{id}/analytics
```

### DOCUMENTS
```
GET    /api/v1/documents
POST   /api/v1/documents
GET    /api/v1/documents/{id}/download
DELETE /api/v1/documents/{id}
```

---

## 📱 FRONTEND PAGE SPECIFICATIONS

### REQUIRED PAGES & COMPONENTS

**1. Authentication Pages:**
- Login page (username/password)
- Password reset (admin-managed)

**2. Dashboard Pages:**
- Regional dashboard (RegionAdmin)
- School dashboard (SchoolAdmin)
- Department-specific dashboards

**3. School Management Pages:**
- Staff management
- Class management  
- Schedule generator
- Student profiles
- Grade entry
- Attendance tracking

**4. Survey Pages:**
- Survey builder
- Survey list (assigned/created)
- Response forms
- Analytics dashboard

**5. Document Pages:**
- Document library
- Upload interface
- Access management

**6. Administrative Pages:**
- User management
- Role assignment
- System configuration

---

## ✅ IMPLEMENTATION CHECKLIST

### Database Migration Priority:
1. ✅ Core auth tables (users, roles, permissions)
2. ✅ Institution hierarchy 
3. ✅ School management tables (students, classes, schedules)
4. ✅ Survey system
5. ✅ Document management
6. ✅ System management (tasks, notifications, audit)

### API Development Priority:
1. ✅ Authentication endpoints
2. ✅ User & role management
3. ✅ School management APIs
4. ✅ Survey system APIs
5. ✅ Document management APIs

### Frontend Development Priority:
1. ✅ Authentication & layout
2. ✅ Dashboard components
3. ✅ School management interfaces
4. ✅ Survey builder & forms
5. ✅ Document management

---

**Status**: ✅ **READY FOR DEVELOPMENT**
**All inconsistencies resolved**: ✅
**Database schema complete**: ✅  
**API endpoints standardized**: ✅
**Development roadmap clear**: ✅

**Next Step**: Begin database migration implementation