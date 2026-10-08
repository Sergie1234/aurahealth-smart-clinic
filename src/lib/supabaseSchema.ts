// Supabase PostgreSQL Schema String for Smart Clinic Outpatient Management
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- Smart Clinic Outpatient Management System
-- Database Schema for Supabase (PostgreSQL)
-- Aligned with Philippine Health Data Security Standards (RA 10173)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Patients Table
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mrn VARCHAR(32) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(16) NOT NULL,
    blood_type VARCHAR(8) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    chronic_conditions JSONB DEFAULT '[]'::jsonb,
    current_medications JSONB DEFAULT '[]'::jsonb,
    primary_doctor_id VARCHAR(64),
    insurance_provider VARCHAR(128),
    insurance_policy_number VARCHAR(64),
    vitals_history JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    patient_mrn VARCHAR(32) NOT NULL,
    doctor_id VARCHAR(64) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    department VARCHAR(128) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(16) NOT NULL,
    duration_minutes INT DEFAULT 30,
    reason TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'Scheduled' NOT NULL, -- Scheduled, Confirmed, Checked In, In Consultation, Completed, Cancelled, No Show
    type VARCHAR(32) DEFAULT 'In-Person',
    queue_number VARCHAR(16),
    room VARCHAR(64),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Consultations Table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(64) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    consultation_date DATE NOT NULL,
    chief_complaint TEXT NOT NULL,
    history_of_present_illness TEXT,
    review_of_systems TEXT,
    physical_examination TEXT,
    vitals JSONB DEFAULT '{}'::jsonb,
    diagnoses JSONB DEFAULT '[]'::jsonb,
    treatment_plan TEXT NOT NULL,
    prescriptions_created JSONB DEFAULT '[]'::jsonb,
    lab_orders_created JSONB DEFAULT '[]'::jsonb,
    follow_up_date DATE,
    follow_up_instructions TEXT,
    medical_certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_number VARCHAR(32) UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    patient_mrn VARCHAR(32) NOT NULL,
    patient_age INT,
    patient_gender VARCHAR(16),
    doctor_id VARCHAR(64) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    doctor_specialty VARCHAR(128),
    doctor_license VARCHAR(64),
    prescription_date DATE NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(32) DEFAULT 'Active' NOT NULL, -- Active, Dispensed, Partially Dispensed, Discontinued
    ai_safety_audit JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Diagnostic Lab Orders Table
CREATE TABLE IF NOT EXISTS public.lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(32) UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    patient_mrn VARCHAR(32) NOT NULL,
    doctor_id VARCHAR(64) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    urgency VARCHAR(32) DEFAULT 'Routine',
    status VARCHAR(32) DEFAULT 'Requested' NOT NULL, -- Requested, Sample Collected, Processing, Result Available, Reviewed
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    results JSONB DEFAULT '[]'::jsonb,
    interpretation TEXT,
    ai_summary TEXT
);

-- 6. Pharmacy & Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    brand VARCHAR(128),
    category VARCHAR(64) NOT NULL,
    batch_number VARCHAR(64) NOT NULL,
    expiration_date DATE NOT NULL,
    supplier VARCHAR(255),
    stock_quantity INT DEFAULT 0,
    reorder_level INT DEFAULT 50,
    purchase_price DECIMAL(10,2) DEFAULT 0.00,
    selling_price DECIMAL(10,2) DEFAULT 0.00,
    unit VARCHAR(32) DEFAULT 'Tablets',
    location VARCHAR(64),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(32) UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    patient_mrn VARCHAR(32) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'Unpaid' NOT NULL, -- Unpaid, Partially Paid, Paid, Cancelled
    payment_method VARCHAR(64),
    payment_date TIMESTAMP WITH TIME ZONE,
    insurance_claim_status VARCHAR(32) DEFAULT 'Not Filed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Audit & Compliance Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous/Authenticated Policies (Customizable in Supabase)
CREATE POLICY "Public Read Access" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Public Insert Access" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access" ON public.patients FOR UPDATE USING (true);

CREATE POLICY "Appointments All Access" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Consultations All Access" ON public.consultations FOR ALL USING (true);
CREATE POLICY "Prescriptions All Access" ON public.prescriptions FOR ALL USING (true);
CREATE POLICY "Lab Orders All Access" ON public.lab_orders FOR ALL USING (true);
CREATE POLICY "Inventory All Access" ON public.inventory_items FOR ALL USING (true);
CREATE POLICY "Invoices All Access" ON public.invoices FOR ALL USING (true);
CREATE POLICY "Audit Logs All Access" ON public.audit_logs FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON public.patients(mrn);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_orders_patient ON public.lab_orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_patient ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- Grants for Supabase PostgREST API (anon, authenticated, service_role)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
`;

export const SUPABASE_GRANT_SQL = `-- Quick Fix for Supabase Error 42501 (Permission Denied)
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query -> Run:
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
`;
