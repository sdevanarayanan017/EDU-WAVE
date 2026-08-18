# EduWeave (v2.0) - AI-Powered Academic Coordination & Anti-Burnout Platform

EduWeave is an enterprise-grade academic coordination and cognitive load management platform engineered to prevent student burnout through proactive cross-subject workload intelligence, collision-aware deadline distribution, contextual syllabus retrieval, diagnostic stress forecasting, and embedded Socratic AI tutoring.

---

## 🌟 Key Features Across All 4 Roles

### 1. Student Portal (`STU-4001`)
* **Diagnostic Onboarding & Calibration Wizard**: 3-step questionnaire rating subject proficiencies (1–5 scale), peak focus hours (Morning/Evening/Night), sprint pacing (Pomodoro vs Deep Flow), and extracurricular commitments.
* **Mathematical Burnout & Stress Engine**:
  $$\text{Base Stress Score} = \sum \left( \frac{\text{Task Priority} \times \text{Estimated Effort Hours}}{\text{Days Until Deadline} \times \text{Subject Proficiency Index}} \right)$$
* **14-Day Cognitive Load Projection**: Real-time visual workload timeline highlighting deadline clustering and collision risks before exams.
* **Contextual Assignment Workspace**: Side-by-side view pairing assignment instructions & Gemini auto-divided milestone subtasks with direct course syllabus outlines, textbook chapter references (e.g., *Campbell Biology Ch 7, p.142–158*), and teacher lecture notes snippets.
* **Embedded Gemini Socratic AI Tutor**: Persistent floating drawer with active subject context injection, concept breakdown, and reflective guardrails (hints and practice questions rather than copy-paste solutions).
* **Project Collaboration Hub & Kanban**: Create student project teams, manage Kanban task boards (To Do, In Progress, Peer Review, Done), and coordinate milestone deliverables.

### 2. Teacher Portal (`TCH-3001`)
* **Class & Section Selector**: Switch seamlessly between assigned classes (e.g. *Grade 10-A Biology*, *Grade 10-B Chemistry*).
* **Cross-Subject Deadline Calendar**: View assignments across Biology, Math, World History, and Computer Science on a unified canvas to avoid scheduling deadlines on congested days.
* **Gemini AI Assignment Assistant**:
  - Live collision analysis & optimal low-stress distribution date recommendations.
  - Automated 4-step task subdivision across preceding days.
* **Course Knowledge Base Management**: Ingest syllabi, topic tags, textbook references, and high-yield teacher notes snippets.
* **Student Project Oversight**: Monitor student team milestones and group deliverables.

### 3. HOD (Department Head) Portal (`HOD-2001`)
* **Department Stress Heatmap**: Aggregated, privacy-safe cognitive load indices across sections to detect curriculum bottlenecks and exam clustering.
* **Institutional Event & Calendar Manager**: Schedule midterms, symposiums, faculty senate meetings, and mandatory reading wellness buffer days.
* **Volunteer & Faculty Sourcing**: Search student volunteer pools filtered by bio skills (e.g., *Lab Assisting*, *Python*, *Public Speaking*), and assign faculty leads.

### 4. Admin Portal (`ADM-1001`)
* **Department Management**: Create academic departments and assign designated HODs.
* **Faculty & Class Allocation**: Map teachers to departments and assign classes/sections.
* **Credential & Identity Generator**: System-generate unique IDs (`STU-XXXX`, `TCH-XXXX`, `HOD-XXXX`, `ADM-XXXX`) and initial temporary passwords with individual or bulk CSV import.
* **System Audit Logs & Global Settings**: Real-time immutable audit trail of logins, assignment distributions, and role changes.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/eduweave.git
cd eduweave

# Install dependencies
npm install
```

### 3. Configure Environment Variables (Optional)
Create a `.env.local` file:
```env
# Google Gemini API Key for AI features (includes built-in academic simulator if omitted)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (Optional - EduWeave includes a complete persistent local reactive engine)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Demo Accounts (1-Click Switcher)

| Role | Unique ID | Email | Default Name |
| :--- | :--- | :--- | :--- |
| **Student** | `STU-4001` | `alex.chen@student.eduweave.edu` | Alex Chen |
| **Teacher** | `TCH-3001` | `e.rostova@eduweave.edu` | Prof. Elena Rostova |
| **HOD** | `HOD-2001` | `m.vance@eduweave.edu` | Dr. Marcus Vance |
| **Admin** | `ADM-1001` | `admin@eduweave.edu` | Principal Robert Sterling |

*Note: All demo accounts use the standard demo password: `password123`.*
*Use the 1-Click Role Switcher bar directly in the top navbar to instantly test all 4 personas without signing in again.*

---

## 🏗️ Architecture & Database Schema

The database schema is fully defined in [`supabase/schema.sql`](supabase/schema.sql) and includes:
- `users`: Unique ID mapping (`ADM-`, `HOD-`, `TCH-`, `STU-`), roles, avatar, bio skills.
- `departments`: Academic faculties with HOD links.
- `classes`: Sections, room numbers, terms, and teacher mappings.
- `class_enrollments`: Student enrollment mapping.
- `syllabi_and_notes`: Contextual unit objectives, textbook pages, and lecture snippets.
- `assignments`: Priority levels (Low/Medium/High-Coral), effort estimates, due dates.
- `sub_tasks`: Gemini-divided daily milestones.
- `student_diagnostics`: 5-point subject proficiency indices, pace, and peak hours.
- `events`: Institutional exams, reading days, symposiums.
- `project_groups` & `project_tasks`: Collaborative student team boards.
- `audit_logs`: Activity and security logs.
