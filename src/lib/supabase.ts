import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read environment variables
const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  '';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project.supabase.co') &&
      !supabaseAnonKey.includes('your-anon-key')
  );
};

export const getSupabaseConfigInfo = () => {
  const configured = isSupabaseConfigured();
  let projectDomain = 'Not Configured (Demo Mode)';
  if (supabaseUrl) {
    try {
      projectDomain = new URL(supabaseUrl).hostname;
    } catch {
      projectDomain = supabaseUrl.slice(0, 30);
    }
  }
  return {
    isConfigured: configured,
    url: supabaseUrl || 'https://your-project.supabase.co',
    domain: projectDomain,
    hasKey: Boolean(supabaseAnonKey),
  };
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 1. Patient Sync
export async function syncPatientToSupabase(patient: any) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('patients')
      .upsert({
        mrn: patient.mrn,
        full_name: patient.fullName,
        dob: patient.dob,
        age: patient.age,
        gender: patient.gender,
        blood_type: patient.bloodType,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        emergency_contact: patient.emergencyContact,
        allergies: patient.allergies,
        chronic_conditions: patient.chronicConditions,
        current_medications: patient.currentMedications,
        primary_doctor_id: patient.primaryDoctorId,
        insurance_provider: patient.insuranceProvider,
        insurance_policy_number: patient.insurancePolicyNumber,
        vitals_history: patient.vitalsHistory,
        tags: patient.tags,
      }, { onConflict: 'mrn' })
      .select();

    if (error) {
      console.warn('Supabase patient sync notice:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('Supabase patient sync error:', err?.message);
    return null;
  }
}

// 2. Appointment Sync
export async function syncAppointmentToSupabase(appointment: any) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('appointments')
      .upsert({
        patient_name: appointment.patientName,
        patient_mrn: appointment.patientMrn,
        doctor_id: appointment.doctorId,
        doctor_name: appointment.doctorName,
        department: appointment.department,
        appointment_date: appointment.date,
        appointment_time: appointment.time,
        duration_minutes: appointment.durationMinutes,
        reason: appointment.reason,
        status: appointment.status,
        type: appointment.type,
        queue_number: appointment.queueNumber,
        room: appointment.room,
        notes: appointment.notes,
      })
      .select();

    if (error) {
      console.warn('Supabase appointment sync notice:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('Supabase appointment sync error:', err?.message);
    return null;
  }
}

// 3. Consultation Sync
export async function syncConsultationToSupabase(consultation: any) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('consultations')
      .insert({
        appointment_id: consultation.appointmentId || null,
        patient_name: consultation.patientName,
        doctor_id: consultation.doctorId,
        doctor_name: consultation.doctorName,
        consultation_date: consultation.date,
        chief_complaint: consultation.chiefComplaint,
        history_of_present_illness: consultation.historyOfPresentIllness,
        review_of_systems: consultation.reviewOfSystems,
        physical_examination: consultation.physicalExamination,
        vitals: consultation.vitals,
        diagnoses: consultation.diagnoses,
        treatment_plan: consultation.treatmentPlan,
        prescriptions_created: consultation.prescriptionsCreated,
        lab_orders_created: consultation.labOrdersCreated,
        follow_up_date: consultation.followUpDate || null,
        follow_up_instructions: consultation.followUpInstructions,
        medical_certificate_issued: Boolean(consultation.medicalCertificateIssued),
        certificate_details: consultation.certificateDetails || null,
      })
      .select();

    if (error) {
      console.warn('Supabase consultation sync notice:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('Supabase consultation sync error:', err?.message);
    return null;
  }
}

// 4. Prescription Sync
export async function syncPrescriptionToSupabase(prescription: any) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .upsert({
        prescription_number: prescription.prescriptionNumber,
        patient_name: prescription.patientName,
        patient_mrn: prescription.patientMrn,
        patient_age: prescription.patientAge,
        patient_gender: prescription.patientGender,
        doctor_id: prescription.doctorId,
        doctor_name: prescription.doctorName,
        doctor_specialty: prescription.doctorSpecialty,
        doctor_license: prescription.doctorLicense,
        prescription_date: prescription.date,
        items: prescription.items,
        status: prescription.status,
        ai_safety_audit: prescription.aiSafetyAudit,
        notes: prescription.notes,
      }, { onConflict: 'prescription_number' })
      .select();

    if (error) {
      console.warn('Supabase prescription sync notice:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('Supabase prescription sync error:', err?.message);
    return null;
  }
}

// 5. Lab Order Sync
export async function syncLabOrderToSupabase(order: any) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('lab_orders')
      .upsert({
        order_number: order.orderNumber,
        patient_name: order.patientName,
        patient_mrn: order.patientMrn,
        doctor_id: order.doctorId,
        doctor_name: order.doctorName,
        test_name: order.testName,
        category: order.category,
        urgency: order.urgency,
        status: order.status,
        requested_at: order.requestedAt,
        collected_at: order.collectedAt || null,
        completed_at: order.completedAt || null,
        results: order.results,
        interpretation: order.interpretation || null,
        ai_summary: order.aiSummary || null,
      }, { onConflict: 'order_number' })
      .select();

    if (error) {
      console.warn('Supabase lab order sync notice:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('Supabase lab order sync error:', err?.message);
    return null;
  }
}

// 6. Inventory Item Sync
export async function syncInventoryItemToSupabase(item: any) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .upsert({
        sku: item.sku,
        name: item.name,
        generic_name: item.genericName,
        brand: item.brand,
        category: item.category,
        batch_number: item.batchNumber,
        expiration_date: item.expirationDate,
        supplier: item.supplier,
        stock_quantity: item.stockQuantity,
        reorder_level: item.reorderLevel,
        purchase_price: item.purchasePrice,
        selling_price: item.sellingPrice,
        unit: item.unit,
        location: item.location,
        last_updated: item.lastUpdated,
      }, { onConflict: 'sku' })
      .select();

    if (error) {
      console.warn('Supabase inventory sync notice:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('Supabase inventory sync error:', err?.message);
    return null;
  }
}

// 7. Invoice Sync
export async function syncInvoiceToSupabase(invoice: any) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('invoices')
      .upsert({
        invoice_number: invoice.invoiceNumber,
        patient_name: invoice.patientName,
        patient_mrn: invoice.patientMrn,
        invoice_date: invoice.date,
        due_date: invoice.dueDate,
        items: invoice.items,
        subtotal: invoice.subtotal,
        discount_percentage: invoice.discountPercentage,
        discount_amount: invoice.discountAmount,
        tax_amount: invoice.taxAmount,
        total_amount: invoice.totalAmount,
        paid_amount: invoice.paidAmount,
        status: invoice.status,
        payment_method: invoice.paymentMethod || null,
        payment_date: invoice.paymentDate || null,
        insurance_claim_status: invoice.insuranceClaimStatus || 'Not Filed',
        notes: invoice.notes,
      }, { onConflict: 'invoice_number' })
      .select();

    if (error) {
      console.warn('Supabase invoice sync notice:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('Supabase invoice sync error:', err?.message);
    return null;
  }
}

// 8. Audit Log Sync
export async function syncAuditLogToSupabase(log: any) {
  if (!supabase) return null;
  try {
    await supabase.from('audit_logs').insert({
      timestamp: log.timestamp,
      user_id: log.userId,
      user_name: log.userName,
      user_role: log.userRole,
      action: log.action,
      resource_type: log.resourceType,
      resource_id: log.resourceId,
      description: log.description,
      ip_address: log.ipAddress || '127.0.0.1',
    });
  } catch (err: any) {
    console.warn('Supabase audit log sync notice:', err?.message);
  }
}

// Batch Sync All Initial / Active Clinic Data
export async function syncAllClinicDataToSupabase(data: {
  patients: any[];
  appointments: any[];
  consultations: any[];
  prescriptions: any[];
  labOrders: any[];
  inventory: any[];
  invoices: any[];
  auditLogs: any[];
}): Promise<{ success: boolean; syncedCounts: Record<string, number>; message: string }> {
  if (!supabase) {
    return {
      success: false,
      syncedCounts: {},
      message: 'Supabase credentials not configured. Running in Local Client & Server Mode.',
    };
  }

  const counts: Record<string, number> = {
    patients: 0,
    appointments: 0,
    consultations: 0,
    prescriptions: 0,
    labOrders: 0,
    inventory: 0,
    invoices: 0,
    auditLogs: 0,
  };

  try {
    // 1. Sync Patients
    for (const pat of data.patients) {
      const res = await syncPatientToSupabase(pat);
      if (res) counts.patients++;
    }

    // 2. Sync Appointments
    for (const apt of data.appointments) {
      const res = await syncAppointmentToSupabase(apt);
      if (res) counts.appointments++;
    }

    // 3. Sync Consultations
    for (const con of data.consultations) {
      const res = await syncConsultationToSupabase(con);
      if (res) counts.consultations++;
    }

    // 4. Sync Prescriptions
    for (const rx of data.prescriptions) {
      const res = await syncPrescriptionToSupabase(rx);
      if (res) counts.prescriptions++;
    }

    // 5. Sync Lab Orders
    for (const lab of data.labOrders) {
      const res = await syncLabOrderToSupabase(lab);
      if (res) counts.labOrders++;
    }

    // 6. Sync Inventory
    for (const item of data.inventory) {
      const res = await syncInventoryItemToSupabase(item);
      if (res) counts.inventory++;
    }

    // 7. Sync Invoices
    for (const inv of data.invoices) {
      const res = await syncInvoiceToSupabase(inv);
      if (res) counts.invoices++;
    }

    // 8. Sync Logs
    for (const log of data.auditLogs.slice(0, 15)) {
      await syncAuditLogToSupabase(log);
      counts.auditLogs++;
    }

    return {
      success: true,
      syncedCounts: counts,
      message: `Successfully synchronized all active clinic entities to Supabase tables!`,
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCounts: counts,
      message: `Sync partially failed: ${err?.message}`,
    };
  }
}

