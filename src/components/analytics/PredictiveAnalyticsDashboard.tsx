import React, { useState, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import {
  calculatePatientRiskStratification,
  predictAppointmentNoShow,
  forecastPharmacyDepletion,
  forecastClinicSurgeCapacity,
  PatientRiskProfile,
  NoShowPrediction,
  StockoutForecast,
  HourlySurgeData,
} from '../../utils/predictiveAnalytics';
import { aiService, PredictiveRiskResponse } from '../../services/aiService';
import {
  TrendingUp,
  AlertTriangle,
  HeartPulse,
  Calendar,
  Clock,
  PackageCheck,
  Activity,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  Users,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Video,
  FileSpreadsheet,
  Zap,
  Info,
  X,
  ArrowUpRight,
  Pill,
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';

export const PredictiveAnalyticsDashboard: React.FC = () => {
  const {
    patients,
    appointments,
    prescriptions,
    labOrders,
    inventory,
    selectPatient,
    setActiveTab,
  } = useClinic();
  const { info: toastInfo, success: toastSuccess } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<
    'stratification' | 'noshow' | 'pharmacy' | 'surge'
  >('stratification');

  // Filter states
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'Critical' | 'High' | 'Moderate' | 'Low'>('ALL');
  const [patientSearch, setPatientSearch] = useState('');
  const [noShowFilter, setNoShowFilter] = useState<'ALL' | 'High' | 'Moderate' | 'Low'>('ALL');

  // AI Deep Dive State
  const [selectedProfileForAI, setSelectedProfileForAI] = useState<PatientRiskProfile | null>(null);
  const [aiReport, setAiReport] = useState<PredictiveRiskResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 1. Calculate Patient Risk Stratifications
  const patientProfiles: PatientRiskProfile[] = useMemo(() => {
    return patients.map((p) =>
      calculatePatientRiskStratification(p, appointments, prescriptions, labOrders)
    );
  }, [patients, appointments, prescriptions, labOrders]);

  // 2. Predict Appointment No-Shows
  const noShowPredictions: NoShowPrediction[] = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'Scheduled' || a.status === 'Confirmed')
      .map((a) => {
        const pat = patients.find((p) => p.mrn === a.patientMrn);
        return predictAppointmentNoShow(a, pat, appointments);
      })
      .sort((a, b) => b.probability - a.probability);
  }, [appointments, patients]);

  // 3. Forecast Pharmacy Depletions
  const stockoutForecasts: StockoutForecast[] = useMemo(() => {
    return inventory
      .map((item) => forecastPharmacyDepletion(item, prescriptions))
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [inventory, prescriptions]);

  // 4. Forecast Clinic Hourly Surge
  const surgeData: HourlySurgeData[] = useMemo(() => {
    return forecastClinicSurgeCapacity(appointments, 4);
  }, [appointments]);

  // Metrics
  const highRiskPatientsCount = patientProfiles.filter(
    (p) => p.overallTier === 'High' || p.overallTier === 'Critical'
  ).length;

  const avgNoShowProb = noShowPredictions.length
    ? Math.round(
        noShowPredictions.reduce((acc, p) => acc + p.probability, 0) /
          noShowPredictions.length
      )
    : 14;

  const criticalMedCount = stockoutForecasts.filter(
    (f) => f.status === 'Critical' || f.status === 'Stockout'
  ).length;

  const peakSurgeHour = [...surgeData].sort(
    (a, b) => b.capacityUtilization - a.capacityUtilization
  )[0];

  // Action handlers
  const handleTriggerOutreach = (pred: NoShowPrediction) => {
    toastInfo(
      `Priority Automated Outreach Triggered: ${pred.patientName} — ${pred.recommendedAction}`
    );
  };

  const handleRunAiDeepDive = async (profile: PatientRiskProfile) => {
    const patientObj = patients.find((p) => p.id === profile.patientId);
    if (!patientObj) return;

    setSelectedProfileForAI(profile);
    setIsAiLoading(true);
    setAiError(null);
    setAiReport(null);

    try {
      const res = await aiService.generatePredictiveRiskAssessment({
        patient: patientObj,
        vitals: patientObj.vitalsHistory?.[0],
        riskProfile: profile,
      });
      setAiReport(res.data);
    } catch (err: any) {
      setAiError(err?.message || 'Failed to complete AI predictive risk analysis');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered Patients
  const filteredProfiles = patientProfiles.filter((p) => {
    const matchTier = riskFilter === 'ALL' || p.overallTier === riskFilter;
    const matchSearch =
      p.patientName.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.mrn.toLowerCase().includes(patientSearch.toLowerCase());
    return matchTier && matchSearch;
  });

  const filteredNoShow = noShowPredictions.filter((p) => {
    return noShowFilter === 'ALL' || p.riskLevel === noShowFilter;
  });

  return (
    <div className="space-y-5">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Machine Learning & Heuristic Predictive Engine
            </span>
            <span className="text-slate-400 text-xs">Continuous Surveillance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5 text-white flex items-center gap-2">
            Predictive Analytics & Clinical Risk Stratification
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Multi-dimensional longitudinal risk forecasting: patient health deterioration scoring, appointment no-show probability, pharmacy stockout forecasting, and clinic surge prediction.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Forecast Window
            </span>
            <span className="text-xs font-bold text-teal-400">Next 30 – 90 Days</span>
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: High Risk Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Elevated Deterioration Risk</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{highRiskPatientsCount}</span>
            <span className="text-xs font-semibold text-rose-600">
              {Math.round((highRiskPatientsCount / (patientProfiles.length || 1)) * 100)}% of Cohort
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requires proactive clinical outreach</p>
        </div>

        {/* KPI 2: No-Show Probability */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Avg No-Show Probability</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{avgNoShowProb}%</span>
            <span className="text-xs font-semibold text-emerald-600">-6.4% projected via SMS</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {noShowPredictions.filter((p) => p.riskLevel === 'High').length} upcoming high-risk visits
          </p>
        </div>

        {/* KPI 3: Stockout Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Critical Stockout Runout</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{criticalMedCount} Items</span>
            <span className="text-xs font-semibold text-purple-600">&lt; 7 Days Buffer</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Reorder PO recommended</p>
        </div>

        {/* KPI 4: Peak Surge Capacity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Peak Inflow Bottleneck</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {peakSurgeHour?.hour || '10:00'}
            </span>
            <span className="text-xs font-semibold text-amber-600">
              {peakSurgeHour?.capacityUtilization || 115}% Capacity
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Deploy additional triage staff</p>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5 text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('stratification')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'stratification'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-teal-400" />
          <span>Patient Risk Stratification</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
            {patientProfiles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('noshow')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'noshow'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Appointment No-Show Forecaster</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
            {noShowPredictions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('pharmacy')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'pharmacy'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PackageCheck className="w-4 h-4 text-purple-400" />
          <span>Pharmacy Depletion Forecaster</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
            {stockoutForecasts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('surge')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'surge'
              ? 'bg-slate-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Clinic Surge & Capacity Forecaster</span>
        </button>
      </div>

      {/* 4. TAB CONTENT: Patient Risk Stratification */}
      {activeSubTab === 'stratification' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[220px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient by name or MRN..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <span className="text-slate-400 text-[11px] px-2 font-medium">Risk Filter:</span>
              {(['ALL', 'Critical', 'High', 'Moderate', 'Low'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setRiskFilter(tier)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    riskFilter === tier
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Risk Profiles Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => {
              const tierBadgeColor = {
                Critical: 'bg-rose-100 text-rose-800 border-rose-300',
                High: 'bg-amber-100 text-amber-800 border-amber-300',
                Moderate: 'bg-blue-100 text-blue-800 border-blue-300',
                Low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
              }[profile.overallTier];

              const progressColor = {
                Critical: 'bg-rose-500',
                High: 'bg-amber-500',
                Moderate: 'bg-blue-500',
                Low: 'bg-emerald-500',
              }[profile.overallTier];

              return (
                <div
                  key={profile.patientId}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{profile.patientName}</h3>
                          <span className="text-[10px] font-mono text-slate-400">{profile.mrn}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {profile.age} yrs • {profile.gender}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tierBadgeColor}`}
                      >
                        {profile.overallTier.toUpperCase()} RISK
                      </span>
                    </div>

                    {/* Overall Risk Score Meter */}
                    <div className="mt-3.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500 font-semibold">Composite Health Risk Index</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {profile.overallScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                          style={{ width: `${profile.overallScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Multi-Domain Risk Gauges */}
                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div className="bg-slate-50 p-1.5 rounded-md border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">Cardiovascular</span>
                        <span
                          className={`text-xs font-bold ${
                            profile.cardioRisk.score >= 60
                              ? 'text-rose-600'
                              : profile.cardioRisk.score >= 35
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {profile.cardioRisk.score}%
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-md border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">Diabetic</span>
                        <span
                          className={`text-xs font-bold ${
                            profile.diabeticRisk.score >= 60
                              ? 'text-rose-600'
                              : profile.diabeticRisk.score >= 35
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {profile.diabeticRisk.score}%
                        </span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-md border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">Readmission</span>
                        <span
                          className={`text-xs font-bold ${
                            profile.readmissionRisk.score >= 60
                              ? 'text-rose-600'
                              : profile.readmissionRisk.score >= 35
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {profile.readmissionRisk.score}%
                        </span>
                      </div>
                    </div>

                    {/* Key Contributing Risk Factors */}
                    <div className="mt-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                        Leading Risk Drivers:
                      </span>
                      <ul className="space-y-1">
                        {profile.keyRiskDrivers.map((driver, idx) => (
                          <li
                            key={idx}
                            className="text-[11px] text-slate-600 flex items-start gap-1.5 leading-snug"
                          >
                            <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                            <span>{driver}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actionable Intervention Recommendations */}
                    <div className="mt-3 bg-teal-50/70 p-2.5 rounded-lg border border-teal-100">
                      <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" />
                        Preventative Protocol:
                      </span>
                      <p className="text-[11px] text-teal-900 leading-snug font-medium">
                        {profile.recommendedInterventions[0]}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleRunAiDeepDive(profile)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer border border-indigo-200"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Predictive Forecast</span>
                    </button>

                    <button
                      onClick={() => {
                        selectPatient(profile.patientId);
                        setActiveTab('consultations');
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open EMR</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: Appointment No-Show Forecaster */}
      {activeSubTab === 'noshow' && (
        <div className="space-y-4">
          {/* No-show explanation banner */}
          <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">No-Show Risk Prediction Model:</span>
              <p className="mt-0.5 text-amber-800">
                Calculates probability of missed visits based on booking lead days, previous patient adherence patterns, scheduled time-of-day barriers, and transportation distance. Proactive reminder protocols can reduce clinic downtime by up to 40%.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              {filteredNoShow.length} Scheduled Encounters Assessed
            </span>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <span className="text-slate-400 text-[11px] px-2 font-medium">Risk Filter:</span>
              {(['ALL', 'High', 'Moderate', 'Low'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setNoShowFilter(tier)}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    noShowFilter === tier
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* No-Show Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Patient & Visit</th>
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Physician / Dept</th>
                    <th className="py-3 px-4">No-Show Probability</th>
                    <th className="py-3 px-4">Identified Risk Drivers</th>
                    <th className="py-3 px-4 text-right">Proactive Intervention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNoShow.map((pred) => {
                    const badgeColor = {
                      High: 'bg-rose-100 text-rose-800 border-rose-300',
                      Moderate: 'bg-amber-100 text-amber-800 border-amber-300',
                      Low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    }[pred.riskLevel];

                    const barColor = {
                      High: 'bg-rose-500',
                      Moderate: 'bg-amber-500',
                      Low: 'bg-emerald-500',
                    }[pred.riskLevel];

                    return (
                      <tr key={pred.appointmentId} className="hover:bg-slate-50/80 transition">
                        {/* Patient */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{pred.patientName}</span>
                          <span className="text-[11px] font-mono text-slate-400">{pred.patientMrn}</span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-3">
                          <span className="text-slate-800 font-medium block">{pred.date}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {pred.time}
                          </span>
                        </td>

                        {/* Doctor */}
                        <td className="py-3.5 px-3">
                          <span className="text-slate-800 block font-medium">{pred.doctorName}</span>
                          <span className="text-[11px] text-slate-500">{pred.department}</span>
                        </td>

                        {/* Probability Meter */}
                        <td className="py-3.5 px-4 min-w-[140px]">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full border ${badgeColor}`}
                            >
                              {pred.riskLevel}
                            </span>
                            <span className="text-slate-900">{pred.probability}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full`}
                              style={{ width: `${pred.probability}%` }}
                            />
                          </div>
                        </td>

                        {/* Drivers */}
                        <td className="py-3.5 px-4">
                          <ul className="space-y-0.5">
                            {pred.contributingFactors.map((f, i) => (
                              <li key={i} className="text-[11px] text-slate-600 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-slate-400" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleTriggerOutreach(pred)}
                            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer border border-teal-200 shadow-2xs"
                          >
                            <Phone className="w-3 h-3 text-teal-700" />
                            <span>Trigger Outreach</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: Pharmacy Depletion Forecaster */}
      {activeSubTab === 'pharmacy' && (
        <div className="space-y-4">
          <div className="bg-purple-50/80 border border-purple-200 p-4 rounded-xl flex items-start gap-3 text-xs text-purple-900">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Medication Depletion Velocity Model:</span>
              <p className="mt-0.5 text-purple-800">
                Computes real-time daily consumption velocity based on active prescriptions dispensed by clinic physicians. Forecasts estimated stockout dates and calculates optimal Economic Order Quantities (EOQ) to prevent medication gaps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stockoutForecasts.map((item) => {
              const statusColor = {
                Stockout: 'bg-rose-100 text-rose-800 border-rose-300',
                Critical: 'bg-rose-100 text-rose-800 border-rose-300',
                Moderate: 'bg-amber-100 text-amber-800 border-amber-300',
                Healthy: 'bg-emerald-100 text-emerald-800 border-emerald-300',
              }[item.status];

              return (
                <div
                  key={item.sku}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{item.genericName}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Current Stock</span>
                        <span className="text-sm font-bold text-slate-900">
                          {item.currentStock} {item.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Daily Burn Rate</span>
                        <span className="text-sm font-bold text-indigo-700">
                          ~{item.dailyConsumptionRate} {item.unit}/day
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Days of Supply Remaining</span>
                        <span
                          className={`font-bold ${
                            item.daysRemaining <= 5
                              ? 'text-rose-600'
                              : item.daysRemaining <= 14
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {item.daysRemaining} Days
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            item.daysRemaining <= 5
                              ? 'bg-rose-500'
                              : item.daysRemaining <= 14
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          } rounded-full`}
                          style={{ width: `${Math.min(item.daysRemaining * 3, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Predicted Depletion Date:</span>
                        <span className="font-semibold text-slate-800">{item.predictedDepletionDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reorder Level Threshold:</span>
                        <span className="font-semibold text-slate-800">{item.reorderLevel} {item.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Recommended EOQ:</span>
                      <span className="text-xs font-bold text-slate-900">
                        +{item.recommendedReorderQty} {item.unit}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        toastSuccess(`Reorder purchase request drafted for ${item.name} (${item.recommendedReorderQty} units).`)
                      }
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs rounded-lg transition border border-purple-200 cursor-pointer"
                    >
                      Draft Reorder PO
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: Clinic Surge & Capacity Forecaster */}
      {activeSubTab === 'surge' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 text-xs text-emerald-900">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Clinic Queue Throughput & Surge Simulation:</span>
              <p className="mt-0.5 text-emerald-800">
                Models patient arrival curves (scheduled encounters + estimated walk-ins) against active clinician and nursing triage capacity. Identifies peak congestion windows to optimize staff allocation.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center justify-between">
              <span>Hourly Patient Inflow vs Staff Capacity (Today)</span>
              <span className="text-xs font-normal text-slate-500">Target Staffing: 4 Active Providers</span>
            </h3>

            <div className="space-y-3">
              {surgeData.map((surge) => {
                const statusBadge = {
                  Bottleneck: 'bg-rose-100 text-rose-800 border-rose-300',
                  Elevated: 'bg-amber-100 text-amber-800 border-amber-300',
                  Normal: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                }[surge.status];

                const barFill = {
                  Bottleneck: 'bg-rose-500',
                  Elevated: 'bg-amber-500',
                  Normal: 'bg-teal-500',
                }[surge.status];

                return (
                  <div key={surge.hour} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 w-12">{surge.hour}</span>
                        <span className="text-slate-600">
                          {surge.expectedPatients} patients expected (Capacity: {surge.staffCapacity})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{surge.capacityUtilization}%</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${statusBadge}`}>
                          {surge.status}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div
                        className={`h-full ${barFill} rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(surge.capacityUtilization, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span className="text-slate-700 font-medium">
                  Staffing Recommendation: Reallocate 1 clinical nurse from administrative review to Lobby Intake between 10:00 and 12:00 to reduce queue waiting time by 18 minutes.
                </span>
              </div>
              <button
                onClick={() => toastSuccess('Operational alert dispatched to Nurse Coordinator.')}
                className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg border border-slate-200 shadow-2xs shrink-0 cursor-pointer"
              >
                Apply Reallocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. AI Deep Dive Modal */}
      {selectedProfileForAI && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 relative my-8">
            <button
              onClick={() => {
                setSelectedProfileForAI(null);
                setAiReport(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  AI Longitudinal Risk & Trajectory Forecast
                </h2>
                <p className="text-xs text-slate-500">
                  Patient: {selectedProfileForAI.patientName} ({selectedProfileForAI.mrn}) • Age {selectedProfileForAI.age}y
                </p>
              </div>
            </div>

            <AIDisclaimerBanner />

            {/* Content Loading */}
            {isAiLoading && (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-600 font-medium">
                  Simulating 90-day clinical trajectory with Gemini 3.8 Flash...
                </p>
              </div>
            )}

            {/* Error */}
            {aiError && !isAiLoading && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {aiError}
              </div>
            )}

            {/* Report Content */}
            {aiReport && !isAiLoading && (
              <div className="mt-4 space-y-4 text-xs">
                {/* Trajectory Synopsis */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Longitudinal Trajectory (30-90 Days):
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {aiReport.patientTrajectorySynopsis}
                  </p>
                </div>

                {/* Stratified Risks Breakdown */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Domain Risk Projections:
                  </span>
                  {aiReport.stratifiedRisks.map((risk, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{risk.category}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            risk.riskLevel === 'HIGH' || risk.riskLevel === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : risk.riskLevel === 'MODERATE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {risk.riskLevel} ({risk.riskScore}%)
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{risk.clinicalRationale}</p>
                      <div className="bg-slate-50 p-2 rounded text-[11px] text-slate-700">
                        <span className="font-semibold text-slate-900">Projected Outlook:</span>{' '}
                        {risk.projected30DayOutlook}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Preventative Protocol */}
                <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-200">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block mb-1.5">
                    Preventative Clinical Action Plan:
                  </span>
                  <ul className="space-y-1">
                    {aiReport.preventativeInterventionPlan.map((action, i) => (
                      <li key={i} className="text-teal-900 text-[11px] flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Surveillance schedule */}
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl text-[11px] text-slate-700">
                  <span className="font-semibold">Recommended Surveillance:</span>
                  <span className="font-bold text-slate-900">{aiReport.recommendedSurveillanceSchedule}</span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedProfileForAI(null)}
                    className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
