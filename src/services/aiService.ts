// Service wrapper for server-side AI endpoints

export interface SOAPResponse {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems: string;
  physicalExamination: string;
  assessment: string;
  treatmentPlan: string;
  suggestedDiagnoses: { code: string; description: string; type: string }[];
  suggestedFollowUpWeeks?: number;
}

export interface PatientSummaryResponse {
  executiveSummary: string;
  keyConditions: string[];
  activeMedicationRegimen: string[];
  allergyAlerts: string[];
  recentLabHighlights: string[];
  vitalTrends: string;
  recommendedActionItems: string[];
  generatedAt: string;
}

export interface LabInterpretationResponse {
  summary: string;
  abnormalFindings: {
    parameter: string;
    value: string;
    flag: string;
    clinicalSignificance: string;
    potentialEtiology: string;
  }[];
  overallImpression: string;
  suggestedNextSteps: string[];
  patientFriendlyExplanation: string;
}

export interface MedicationSafetyResponse {
  safe: boolean;
  overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  warnings: string[];
  interactions: {
    drugA: string;
    drugB: string;
    severity: string;
    description: string;
  }[];
  allergyAlerts: string[];
  clinicalRecommendations: string[];
}

export interface PredictiveRiskResponse {
  patientTrajectorySynopsis: string;
  stratifiedRisks: {
    category: string;
    riskScore: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    clinicalRationale: string;
    projected30DayOutlook: string;
  }[];
  preventativeInterventionPlan: string[];
  recommendedSurveillanceSchedule: string;
}

export const aiService = {
  // 1. Generate Structured Clinical Consultation (SOAP)
  async generateClinicalNotes(payload: {
    patientInfo: any;
    rawNotes: string;
    vitals?: any;
    chiefComplaint?: string;
  }): Promise<{ data: SOAPResponse; disclaimer: string }> {
    const res = await fetch('/api/ai/clinical-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate clinical notes');
    return res.json();
  },

  // 2. Generate Patient Medical Summary
  async generatePatientSummary(payload: {
    patient: any;
    consultations?: any[];
    labOrders?: any[];
    prescriptions?: any[];
  }): Promise<{ data: PatientSummaryResponse; disclaimer: string }> {
    const res = await fetch('/api/ai/patient-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate patient summary');
    return res.json();
  },

  // 3. Interpret Lab Panel Results
  async interpretLabResults(payload: {
    testName: string;
    category: string;
    results: any[];
    patientContext?: any;
  }): Promise<{ data: LabInterpretationResponse; disclaimer: string }> {
    const res = await fetch('/api/ai/lab-interpretation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to interpret lab results');
    return res.json();
  },

  // 4. Check Medication Safety & Interactions
  async checkMedicationSafety(payload: {
    proposedItems: any[];
    currentMedications?: string[];
    allergies?: any[];
    conditions?: string[];
  }): Promise<{ data: MedicationSafetyResponse; disclaimer: string }> {
    const res = await fetch('/api/ai/medication-safety', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to run medication safety check');
    return res.json();
  },

  // 5. Chat with AI Medical & Administrative Assistant
  async sendChatMessage(payload: {
    message: string;
    conversationHistory: { sender: string; text: string }[];
    context: any;
    role: string;
  }): Promise<{ reply: string; disclaimer: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to send message to AI assistant');
    return res.json();
  },

  // 6. Generate Longitudinal Predictive Risk & Trajectory Assessment
  async generatePredictiveRiskAssessment(payload: {
    patient: any;
    vitals?: any;
    riskProfile?: any;
  }): Promise<{ data: PredictiveRiskResponse; disclaimer: string }> {
    const res = await fetch('/api/ai/predictive-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate predictive risk assessment');
    return res.json();
  },
};
