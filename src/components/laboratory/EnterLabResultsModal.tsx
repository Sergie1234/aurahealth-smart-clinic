import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { LabTestOrder, LabResultItem } from '../../types/clinic';
import { X, FlaskConical, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface Props {
  order: LabTestOrder;
  onClose: () => void;
}

export const EnterLabResultsModal: React.FC<Props> = ({ order, onClose }) => {
  const { enterLabResults } = useClinic();

  const [items, setItems] = useState<LabResultItem[]>(
    order.results || [
      { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.5 - 17.5', flag: 'Normal' },
      { parameter: 'White Blood Cell (WBC)', value: '6.8', unit: '10³/µL', referenceRange: '4.5 - 11.0', flag: 'Normal' },
      { parameter: 'Platelets', value: '240', unit: '10³/µL', referenceRange: '150 - 450', flag: 'Normal' },
    ]
  );

  const [newParameter, setNewParameter] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newRef, setNewRef] = useState('');
  const [newFlag, setNewFlag] = useState<'Normal' | 'High' | 'Low' | 'Critical'>('Normal');
  const [interpretation, setInterpretation] = useState('');

  const handleAddItem = () => {
    if (!newParameter.trim() || !newValue.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        parameter: newParameter.trim(),
        value: newValue.trim(),
        unit: newUnit.trim() || 'mg/dL',
        referenceRange: newRef.trim() || 'Normal',
        flag: newFlag,
      },
    ]);
    setNewParameter('');
    setNewValue('');
    setNewUnit('');
    setNewRef('');
    setNewFlag('Normal');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    enterLabResults(order.id, items, interpretation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Enter Certified Lab Results</h2>
              <p className="text-[11px] text-slate-500">
                {order.testName} ({order.orderNumber}) • Patient: {order.patientName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Current Parameter Rows */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 text-[10px] uppercase tracking-wider block">
              Parameter Results ({items.length})
            </label>
            <div className="space-y-1.5">
              {items.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <span className="font-bold text-slate-900">{item.parameter}</span>
                    <span className="ml-2 font-mono text-slate-600 font-bold">{item.value} {item.unit}</span>
                    <span className="text-[10px] text-slate-400 ml-2">Ref: {item.referenceRange}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.flag === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : item.flag === 'Low'
                          ? 'bg-amber-100 text-amber-800'
                          : item.flag === 'Critical'
                          ? 'bg-red-600 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.flag}
                    </span>
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Parameter */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">+ Add Parameter</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Parameter Name (e.g. Glucose)"
                value={newParameter}
                onChange={(e) => setNewParameter(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded text-xs"
              />
              <input
                type="text"
                placeholder="Observed Value (e.g. 104)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded text-xs"
              />
              <input
                type="text"
                placeholder="Unit (e.g. mg/dL)"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded text-xs"
              />
              <input
                type="text"
                placeholder="Reference Range (e.g. 70 - 99)"
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                className="p-1.5 bg-white border border-slate-200 rounded text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-semibold text-[10px]">Flag:</span>
                <select
                  value={newFlag}
                  onChange={(e) => setNewFlag(e.target.value as any)}
                  className="p-1 bg-white border border-slate-200 rounded text-xs"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs cursor-pointer"
              >
                + Add Parameter
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Pathologist Interpretation / Comments</label>
            <textarea
              rows={2}
              placeholder="e.g. Specimen analyzed with automated photometric assay. Sample within QC limits."
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Certify & Release Results
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
