import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const PlacementSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data.success) setSettings(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.put('/admin/settings', {
        allowMultipleOffers: settings.allowMultipleOffers,
        maxApplicationsPerStudent: settings.maxApplicationsPerStudent,
        blockPlacedFromApplying: settings.blockPlacedFromApplying,
        minCGPAOverride: settings.minCGPAOverride,
        placementSeasonActive: settings.placementSeasonActive
      });
      if (res.data.success) {
        setSettings(res.data.data);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save' });
    } finally { setSaving(false); }
  };

  const toggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading) return <Loader />;
  if (!settings) return <p className="text-center text-slate-500 mt-10">Failed to load settings.</p>;

  const ToggleSwitch = ({ label, description, field, warning }) => (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 transition">
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        {warning && settings[field] && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> {warning}
          </p>
        )}
      </div>
      <button
        onClick={() => toggle(field)}
        className="flex-shrink-0 mt-0.5"
        id={`toggle-${field}`}
      >
        {settings[field] ? (
          <ToggleRight className="w-10 h-10 text-indigo-600" />
        ) : (
          <ToggleLeft className="w-10 h-10 text-slate-300" />
        )}
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Placement Settings</h1>
            <p className="text-slate-500 text-sm">Global rules governing the placement process</p>
          </div>
        </div>
      </motion.div>

      {message.text && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
          {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      {/* Toggle Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Access Controls</h2>

        <ToggleSwitch
          label="Placement Season Active"
          description="When disabled, no students can submit new applications."
          field="placementSeasonActive"
          warning="Season is active — students can apply to jobs."
        />

        <ToggleSwitch
          label="Block Placed Students"
          description="Prevent students who already accepted an offer from applying to more jobs."
          field="blockPlacedFromApplying"
        />

        <ToggleSwitch
          label="Allow Multiple Offers"
          description="Let students accept more than one offer simultaneously."
          field="allowMultipleOffers"
          warning="Multiple offers are allowed — students can hold concurrent acceptances."
        />
      </motion.div>

      {/* Numeric Settings */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Limits & Thresholds</h2>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Max Applications Per Student
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Maximum number of active (non-withdrawn/rejected) applications a student can have. Set to 0 for unlimited.
          </p>
          <input
            type="number"
            min="0"
            max="50"
            value={settings.maxApplicationsPerStudent}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              maxApplicationsPerStudent: Math.max(0, parseInt(e.target.value) || 0)
            }))}
            className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            id="max-applications-input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Global Minimum CGPA
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Floor CGPA for all jobs. Overrides individual job settings if this is higher. Set to 0 to disable.
          </p>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={settings.minCGPAOverride}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              minCGPAOverride: Math.min(10, Math.max(0, parseFloat(e.target.value) || 0))
            }))}
            className="w-32 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            id="min-cgpa-input"
          />
        </div>
      </motion.div>

      {/* Metadata */}
      {settings.lastUpdatedBy && (
        <div className="text-xs text-slate-400 text-center">
          Last updated by <span className="font-medium text-slate-500">{settings.lastUpdatedBy.name}</span>
          {settings.updatedAt && ` on ${new Date(settings.updatedAt).toLocaleString()}`}
        </div>
      )}

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          id="save-settings-btn"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </motion.div>
    </div>
  );
};

export default PlacementSettings;
