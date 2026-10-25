# Global Print System Complete Rewrite (Direct Print Engine)

Complete ground-up rewrite of the printing system across SmartClinic. Replaces all legacy modal abstractions, broken timers, and duplicate print containers with a unified direct-print architecture that immediately triggers the native browser print dialog with official A4 clinical stationery.

## User Review & Critical Decisions

> [!IMPORTANT]
> Based on your confirmed preferences in the interactive interview:
> - **Direct Execution**: Clicking any print action (Prescription, Receipt, Lab Report) will **directly trigger the browser print dialog** immediately without an on-screen preview modal curtain.
> - **Document Standard**: Standard **A4 clinical stationery** formatted with SmartClinic branding, official DOH/PRC credentials, PhilHealth alignment, itemized tables, and certified QR verification marks.
> - **Print Execution Engine**: Direct browser window print via **dedicated `@media print` CSS engine**, guaranteeing zero leakage of screen UI chrome, headers, or sidebar navigation into the output.

---

## 1. Overview & Core Concept

- **What It Does**: Provides instant, reliable, 1-click printing across all clinic modules (Prescriptions, Billing Receipts, Diagnostic Lab Orders, Patient EMR, and Patient Portals). When a user clicks print, the system instantly stages the clinical document into a dedicated print mount outside `#root` and invokes `window.print()`.
- **Target Audience**: Attending physicians, clinic cashiers, laboratory technologists, nurses, and patients.
- **Key Value**: Eliminates modal bugs, double-dialog friction, and print-blanking errors. Guarantees that printed or PDF-saved documents are complete, high-contrast, and legally compliant with Philippine medical documentation standards (RA 10918, RA 8792, BIR CAS).

---

## 2. User Experience & Visual Design

### User Interaction Flow
```
User clicks "Print Prescription" / "Print Receipt" / "Print Lab Report"
                           │
                           ▼
PrintContext updates active print target & document payload
                           │
                           ▼
DirectPrintMount stages standard A4 clinical document into #smartclinic-print-mount
                           │
                           ▼
Browser natively opens Print / PDF Preview Dialog (window.print)
                           │
                           ▼
On print completion or dismissal, state cleanly resets for next action
```

### Document Visual Specifications (A4 Portrait Stationery)
1. **Official Clinic Rx (Prescription)**:
   - Clinic header with SmartClinic emblem, outpatient department details, clinic address, and contact lines.
   - Physician box: Doctor name, medical specialty, PRC license number, and PTR number.
   - Patient demographics: Full name, MRN, age, sex, PhilHealth registration, and issue date.
   - Medical body: Classic serif ℞ insignia, numbered formulation entries (brand, generic, dosage, frequency, duration, route, and explicit instructions).
   - Validation & Security: AI safety check badge, RA 10918 generics notice, physician signature baseline, and cryptographic security verification hash.

2. **Official Payment Receipt (BIR CAS Compliant)**:
   - Clinic revenue header with BIR CAS registration note, TIN, and terminal identifier.
   - Itemized financial ledger table: Outpatient service/medication description, category, quantity, unit rate, and total in Philippine Peso (₱).
   - Tax & exemption breakdown: Gross assessment, Senior Citizen / PWD statutory discount deduction, PhilHealth / HMO subsidy, and net balance due.
   - Cashier validation, settlement method (Cash, GCash, Maya, Debit), and BIR tax-exemption notice under Section 109 of the NIRC.

3. **Certified Diagnostic Laboratory Report**:
   - Laboratory header with clinical pathology accreditation (CLIA / DOH license numbers).
   - Ordering doctor, specimen collection timestamp, reported timestamp, and test panel category.
   - Structured assay results grid: Parameter, observed value, unit, reference interval, and status flag (Normal, High, Low, Critical).
   - Pathologist interpretation summary and certified digital sign-off block.

---

## 3. Key Product Decisions & Trade-Offs

- **Direct Trigger vs. Preview Modal**:
  - *Decision*: Directly trigger browser print dialog without intermediate preview modal, as explicitly chosen in Phase 1.
  - *Why*: Eliminates modal state clashes, reduces click friction from two steps to one, and allows the native browser print engine (with its built-in full-page zoom, margin adjuster, and PDF exporter) to act as the authoritative preview.
  - *Trade-off*: Users preview directly inside the browser's native print preview dialog rather than an in-app HTML modal.

- **Unified `@media print` CSS Engine vs. Iframe Isolation**:
  - *Decision*: Direct browser window print driven by a dedicated, pristine `@media print` stylesheet in `src/index.css`.
  - *Why*: Direct `window.print()` avoids cross-origin iframe security restrictions, preserves CSS variables and Tailwind v4 utility rules, and ensures hardware printer drivers receive immediate vector rendering.

---

## 4. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SmartClinic Application                       │
│                                                                        │
│  ┌───────────────────────┐   ┌───────────────────┐   ┌──────────────┐  │
│  │ PrescriptionList      │   │ BillingList       │   │ LabOrdersList│  │
│  │ PatientDashboardView  │   │ PatientPortal     │   │ PatientDetail│  │
│  └───────────┬───────────┘   └─────────┬─────────┘   └───────┬──────┘  │
│              │                         │                     │         │
│              └─────────────────────────┼─────────────────────┘         │
│                                        ▼                               │
│                         ┌─────────────────────────────┐                │
│                         │        PrintContext         │                │
│                         │  • printPrescription(rx)    │                │
│                         │  • printReceipt(inv)        │                │
│                         │  • printLabReport(order)    │                │
│                         └──────────────┬──────────────┘                │
│                                        │                               │
│                                        ▼                               │
│                         ┌─────────────────────────────┐                │
│                         │      DirectPrintMount       │                │
│                         │  (Portaled outside #root)   │                │
│                         │  #smartclinic-print-mount   │                │
│                         └──────────────┬──────────────┘                │
│                                        │                               │
│                                        ▼                               │
│                         ┌─────────────────────────────┐                │
│                         │  Native window.print() API  │                │
│                         │   @media print A4 Styling   │                │
│                         └─────────────────────────────┘                │
└────────────────────────────────────────────────────────────────────────┘
```

### Proposed Changes

1. **Delete & Clean Up Legacy Code**:
   - Remove obsolete modal files: `PrescriptionPrintModal.tsx`, `ReceiptPrintModal.tsx`, `LabReportModal.tsx`, and `GlobalPrintModal.tsx`.
   - Purge old duplicate styles and broken timers from `index.html` and `src/index.css`.

2. **New Core Print Engine (`src/services/printEngine.ts` / `src/context/PrintContext.tsx`)**:
   - Clean, typed `PrintContext` providing `printPrescription(rx)`, `printReceipt(invoice)`, and `printLabReport(order)`.
   - `DirectPrintMount.tsx`: High-contrast, pristine A4 stationery templates for all three document types, mounted directly into `document.body` via React portal with ID `#smartclinic-print-mount`.
   - Automated native trigger: Sets `document.title` to the official document reference, dispatches `window.print()`, and cleanly resets document state via `afterprint`.

3. **Global CSS Rules (`src/index.css`)**:
   - `@media screen`: `#smartclinic-print-mount { display: none !important; }`.
   - `@media print`:
     - `@page { size: A4 portrait; margin: 10mm 12mm; }`
     - `#root, button, header, aside, nav, main, footer { display: none !important; }`
     - `#smartclinic-print-mount { display: block !important; visibility: visible !important; width: 100% !important; background: #fff !important; }`
     - `#smartclinic-print-mount * { visibility: visible !important; -webkit-print-color-adjust: exact !important; }`

4. **Verify Wiring Across All Components**:
   - `src/components/prescriptions/PrescriptionList.tsx`
   - `src/components/billing/BillingList.tsx`
   - `src/components/laboratory/LabOrdersList.tsx`
   - `src/components/dashboards/PatientDashboardView.tsx`
   - `src/components/patient_portal/PatientPortalDashboard.tsx`
   - `src/components/patients/PatientDetailModal.tsx`
   - `src/App.tsx`

---

## 5. Verification Plan

1. **Build & Syntax Verification**:
   - Run `compile_applet` and `lint_applet` to verify zero TypeScript or build errors.
2. **Prescription Print Flow**:
   - Trigger print from Prescriptions tab, Patient Dashboard, and Patient Detail Modal.
   - Verify document title is set (e.g., `SmartClinic-Rx-RX-2025-001`), `window.print()` triggers, and paper format is strictly A4 portrait.
3. **Receipt Print Flow**:
   - Trigger print from Billing list, Patient Dashboard, and Patient Portal.
   - Verify itemized amounts in ₱, tax compliance, and cashier details.
4. **Lab Report Print Flow**:
   - Trigger print from Laboratory orders and Patient timeline.
   - Verify assay table, abnormal flags, and certified path report format.
