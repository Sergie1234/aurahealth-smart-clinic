# SmartClinic AI Engine & Role Isolation Architecture

Comprehensive architectural plan to enforce strict, unbreachable role-based isolation between Patient, Provider, and Admin accounts, eradicate cross-role switching controls, repair layout and alignment flaws across the AI Engine and navigation panels, and reinforce backend RBAC verification.

> [!IMPORTANT]
> **Key Architecture Decisions for Review:**
> - **Zero Cross-Role UI Switching**: All inline runtime role switchers (such as the `Patient | Provider | Admin` tabs in the AI Engine header) are permanently removed. Role identity is authoritatively determined at login and cryptographically bound in the authentication session. Switching roles requires a clean sign-out.
> - **Role Module Strictness**:
>   - **Patient**: Restricted strictly to My Health Portal, My Appointments, Live Queue & Waiting Room, My Medical Records, My Prescriptions, My Diagnostic Lab, My Billing & Invoices, and Patient-only AI Triage Chatbot.
>   - **Provider**: Tailored to Patient Search & Directory, Appointment Management, Clinical Charting & Notes, Prescription Writing, Lab Orders, Triage Review & Queue, and Provider Clinical Decision Support AI.
>   - **Admin**: Dedicated to User & Staff Management, System Settings, Audit & Compliance Logs, Clinic Configuration, Reports & Analytics, and Administrative Operational AI.
> - **AI Engine Layout Restructuring**: The AI panel header, active task rules, critical medical emergency disclaimer banner, prompt suggestions, and message container are rebuilt with unified flex/grid containers to prevent layout breakage or awkward wrapping on all viewports.

---

## 1. Overview & Core Concept

### What It Does
SmartClinic AI is an enterprise-grade outpatient healthcare operations platform. This update completely decouples user experiences by user type so that patients, clinical providers (doctors, nurses, specialists), and clinic administrators operate in separate interfaces. The AI Engine dynamically locks into the authorized role’s specific scope (Symptom Triage for patients, Clinical Decision Support for providers, and Operational Intelligence for administrators) with strict guardrails preventing privilege escalation or data leakage.

### Target Audience & Personas
1. **Patient Persona**: Outpatient seeking rapid symptom evaluation, queue status, personal health history, digital prescriptions, and invoice settlement without clinical jargon or exposure to other patients' records.
2. **Provider Persona**: Attending physicians and healthcare practitioners requiring streamlined charting, drug interaction checking, electronic prescribing, lab ordering, and diagnostic decision support.
3. **Admin Persona**: Clinic operators overseeing user permissions, facility settings, regulatory compliance (Data Privacy Act / RA 10173), audit trails, and revenue cycle analytics.

### Key Value
- **Uncompromised Clinical Privacy**: Elimination of cross-role inspection tabs guarantees compliance with healthcare data protection standards.
- **Intuitive Workflow Focus**: Each role receives an unencumbered workspace free from extraneous tools intended for other departments.
- **Rock-Solid Layout Stability**: Fixes alignment defects across the AI engine, disclaimers, chat bubble streams, and responsive sidebars.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[Public Homepage / Login Screen]
               │
               ▼ (Auth + Role Binding)
       ┌───────┼───────────────────┐
       ▼                           ▼                           ▼
[Patient Portal]           [Provider Hub]              [Admin Console]
 ├─ Health Portal           ├─ Patient Directory        ├─ User Management
 ├─ My Appointments         ├─ Appointment Calendar     ├─ Clinic Config
 ├─ Live Queue Room         ├─ Consultation Charting    ├─ Audit & Compliance
 ├─ My Medical Records      ├─ Rx Writing & Dispense    ├─ Reports & Analytics
 ├─ My Prescriptions        ├─ Diagnostic Lab Orders    ├─ System Settings
 ├─ My Diagnostic Lab       ├─ Triage Review & Queue    └─ Operational AI
 ├─ My Billing & Invoices   └─ Clinical AI Assistant
 └─ Patient AI Triage
```

1. **Authentication & Automatic Routing**:
   - The user selects their designated credential track on the unified Login Portal.
   - Upon successful verification, the session issues an authorization token and lands the user immediately on their respective home dashboard without any role tabs in the header or sidebar.
2. **Patient Session Experience**:
   - Navigation displays patient-centric modules with zero access to administrative or multi-patient search tools.
   - The AI Assistant is pre-locked to **Patient AI Triage Chatbot**, prominently displaying the emergency disclaimer with immediate emergency hotlines and red-flag symptom escalation.
3. **Provider Session Experience**:
   - Navigation highlights the clinical queue, active patient directory, EHR notes, prescription writer, and lab ordering desk.
   - The AI Engine is configured as **Clinical Decision Support**, assisting with differential diagnoses, medication interactions, and ICD-10 charting hints.
4. **Admin Session Experience**:
   - Navigation provides administrative oversight: Staff & User Management, Clinic Operational Settings, System Audit Logs, and Analytics.
   - The AI Engine is configured as **Clinic Operations Copilot**, analyzing wait times, appointment bottlenecks, and inventory burn rates.

### Visual Identity & Theme
- **Aesthetic Direction**: Clinical modernism with a clean dark-mode foundation and deep teal accents (`#0D9488` / `teal-600`), conveying surgical precision, trust, and calm.
- **Color Palette**:
  - Dominant Neutral: Deep slate canvas (`#020617` / `slate-950` and `#0F172A` / `slate-900`).
  - Structural Surfaces: Bordered panels (`border-slate-800` / `bg-slate-900/80`) with 1px hairline dividers.
  - Accent Tones: Vibrant clinical teal (`teal-500` / `teal-600`) for active states and primary CTAs; emerald (`#10B981`) for nominal patient records; rose (`#EF4444`) strictly reserved for medical emergency callouts.
- **Typography & Hierarchy**:
  - Display & Headings: `Plus Jakarta Sans` or modern geometric sans with tabular numerals for vitals, queue counts, and timestamps (`tabular-nums`).
  - Body: Balanced neutral sans with generous 1.5 line heights.
  - Anti-Pill Discipline: Unboxed metadata typography separated by clean middle dots (`·`) instead of stacked colored badges.

### Layout & Spacing Realignment
- **AI Engine Header**:
  - Clean two-zone flex layout: Logo + Title + Current Sub-Task Indicator on the left; Rulebook modal trigger and Clear Chat button on the right.
  - Role switcher completely removed from the header.
  - Responsive alignment with unified padding (`p-4 sm:p-5`) and strict min/max constraints.
- **Emergency Disclaimer Banner**:
  - Refactored as a self-contained card with clean padding and flex alignment. Prevents text overlapping or breaking out on narrow screens.
  - In Patient Mode: Emergency alert styling with single-tap emergency action buttons (Call 911 / National Emergency hotline).
  - In Provider Mode: Compact legal decision-support banner reminding that AI suggestions do not replace licensed medical judgment.
- **Chat & Prompt Stream**:
  - Clean flex-col layout filling the exact viewport height without page-level double scrollbars.
  - Prompt suggestion chips formatted as clean interactive buttons with horizontal scrolling and no text clipping.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Removal of Runtime Role Switcher Tabs**:
  - *Chosen Approach*: Completely remove the `Patient | Provider | Admin` tab bar from the AI Hub and top navigation. Role assignment is immutable for the duration of the authenticated session.
  - *Why*: In a real clinical environment, letting an active user toggle freely between a patient view and a provider or admin view violates fundamental security segregation and creates severe HIPAA / RA 10173 data exposure risks. Switching roles requires deliberate logout and re-authentication.
  - *Alternatives Considered*: Retaining role switching for "demo mode" was rejected because it violates the user's primary requirement and encourages unsafe UX habits.

- **Decision 2: Sub-Context Page Selection Within Role**:
  - *Chosen Approach*: While roles cannot be switched, within their authorized role, users can select the active page context for the AI (e.g., Provider can focus AI on "Consultations", "Lab Orders", or "Prescriptions"; Patient can focus on "Triage", "My Appointments", or "My Records").
  - *Why*: Allows the AI Engine to provide hyper-relevant context without leaking unauthorized data across boundaries.

- **Decision 3: Backend Guardrails & URL Tamper Protection**:
  - *Chosen Approach*: Enforce route guards in both the frontend router and backend Express middleware. If an authenticated patient alters client-side state or makes API requests for `/api/admin/*` or `/api/patients` (directory), the server responds with `403 Forbidden` and the frontend redirects to their own authorized dashboard.

---

## 4. Technical Architecture & Data Strategy

### System & Access Isolation Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Authenticated Session                           │
│              (Token: User ID, Primary Role, Sub-Role)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
            ┌───────────────────────┼────────────────────────┐
            ▼                       ▼                        ▼
┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐
│     Patient Scope     │ │   Provider Scope  │ │      Admin Scope       │
├───────────────────────┤ ├───────────────────┤ ├────────────────────────┤
│ • My Health Portal    │ │ • Patient Search  │ │ • User Management      │
│ • My Appointments     │ │ • Appointments    │ │ • Clinic Config        │
│ • Live Queue Room     │ │ • Charting/Notes  │ │ • System Audit Logs    │
│ • My Medical Records  │ │ • Prescriptions   │ │ • Reports & Analytics  │
│ • My Prescriptions    │ │ • Lab Orders      │ │ • Role Permissions     │
│ • My Diagnostic Lab   │ │ • Triage Review   │ │ • Operations AI Engine │
│ • My Billing          │ │ • Provider AI Hub │ └────────────────────────┘
│ • Patient Triage AI   │ └───────────────────┘
└───────────────────────┘
            │                       │                        │
            ▼                       ▼                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  Backend Express RBAC & Tenant Guard                   │
│   (Token verification, patient isolation, audit trail generation)      │
└────────────────────────────────────────────────────────────────────────┘
```

### Component State & Route Matrix

| Route / Tab Identifier | Patient Access | Provider Access | Admin Access | Assigned Component & Scope |
| :--- | :---: | :---: | :---: | :--- |
| `dashboard` | Yes | Yes | Yes | Dynamic role-specific view (`PatientDashboardView`, `DoctorDashboardView`, `AdminDashboardView`) |
| `appointments` | Yes (Personal) | Yes (Clinic) | No | Appointment calendar and booking |
| `queue` | Yes (Waiting Room) | Yes (Triage Review) | No | Live clinic queue manager |
| `patients` | **Blocked** | Yes | No | Patient search and directory |
| `consultations` | **Blocked** | Yes | No | Clinical charting and EMR encounter suite |
| `emr` | Yes (Personal) | Yes (Clinic) | No | Patient electronic medical records |
| `prescriptions` | Yes (Personal) | Yes (Writing/Rx) | No | E-Prescription management |
| `laboratory` | Yes (Personal) | Yes (Orders/Results) | No | Diagnostic lab tracking |
| `billing` | Yes (Personal) | No | No | Invoices & payment settlement |
| `inventory` | **Blocked** | No | No | Pharmacy stock management |
| `reports` | **Blocked** | No | Yes | Clinic business intelligence & reporting |
| `predictive-analytics` | **Blocked** | Yes | Yes | Operational forecasts |
| `admin-users` | **Blocked** | **Blocked** | Yes | User & staff management |
| `audit-logs` | **Blocked** | **Blocked** | Yes | System compliance & audit trail |
| `ai-assistant` | Yes (Triage) | Yes (Clinical) | Yes (Admin) | Locked strictly to current user's authenticated persona |

### Verification & Testing Plan
1. **Patient Verification**:
   - Sign in as Patient (`maria.santos@email.com` or registered patient).
   - Verify sidebar only displays the 8 authorized modules.
   - Verify absence of all provider/admin controls and search bars.
   - Open AI Assistant: verify it opens in Patient Triage mode with emergency disclaimers and no role selector.
2. **Provider Verification**:
   - Sign in as Provider (`dr.reyes@smartclinic.ph`).
   - Verify sidebar displays Patient list, Appointments, Charting, Prescriptions, Lab orders, Triage review, and Clinical AI.
   - Verify AI Hub operates in Clinical Decision Support mode with zero administrative or cross-role options.
3. **Admin Verification**:
   - Sign in as Administrator (`smartclinicrealacc@gmail.com`).
   - Verify sidebar displays User management, Clinic configuration, Audit logs, and Reports.
   - Verify clinical patient records and prescription writing are restricted from administrative tampering.
4. **Layout Alignment Testing**:
   - Inspect AI Hub on desktop ($1440\text{px}$), tablet ($768\text{px}$), and mobile ($375\text{px}$) to verify proper alignment, responsive padding, zero overlapping text, and intact emergency disclaimers.
