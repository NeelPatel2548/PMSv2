import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight, Mail, Phone, MapPin } from 'lucide-react';
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
        placementSeasonActive: settings.placementSeasonActive,
        // Branding & contact fields
        logoUrl: settings.logoUrl,
        companyName: settings.companyName,
        contactEmail: settings.contactEmail,
        phone: settings.phone,
        address: settings.address
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
  if (!settings) return <p className="text-center text-bauhaus-black/50 mt-10 font-bold uppercase">Failed to load settings.</p>;

  const ToggleSwitch = ({ label, description, field, warning }) => (
    <div className="flex items-start justify-between gap-4 p-4 border-2 border-bauhaus-black/20 hover:border-bauhaus-black transition bg-bauhaus-white">
      <div className="flex-1">
        <p className="text-sm font-black text-bauhaus-black uppercase">{label}</p>
        <p className="text-xs text-bauhaus-black/50 mt-0.5 font-medium">{description}</p>
        {warning && settings[field] && (
          <p className="text-xs text-bauhaus-yellow mt-1 flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3 h-3" /> {warning}
          </p>
        )}
      </div>
      <button onClick={() => toggle(field)} className="flex-shrink-0 mt-0.5" id={`toggle-${field}`}>
        {settings[field] ? (
          <ToggleRight className="w-10 h-10 text-bauhaus-blue" />
        ) : (
          <ToggleLeft className="w-10 h-10 text-bauhaus-black/20" />
        )}
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-bauhaus-red flex items-center justify-center border-2 border-bauhaus-black">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-bauhaus-black uppercase tracking-wider">Placement Settings</h1>
          <p className="text-bauhaus-black/50 text-sm font-medium">Global rules governing the placement process</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-3 text-sm flex items-center gap-2 border-2 border-bauhaus-black font-bold ${
          message.type === 'success' ? 'bg-bauhaus-yellow text-bauhaus-black' : 'bg-bauhaus-red text-white'
        }`}>
          {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {/* Toggle Settings */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm space-y-4">
        <h2 className="text-lg font-black text-bauhaus-black mb-2 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Access Controls</h2>

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
      </div>

      {/* Numeric Settings */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm space-y-5">
        <h2 className="text-lg font-black text-bauhaus-black mb-2 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Limits & Thresholds</h2>

        <div>
          <label className="block text-sm font-black text-bauhaus-black mb-1 uppercase">Max Applications Per Student</label>
          <p className="text-xs text-bauhaus-black/50 mb-2 font-medium">Maximum number of active applications a student can have. Set to 0 for unlimited.</p>
          <input type="number" min="0" max="50" value={settings.maxApplicationsPerStudent}
            onChange={(e) => setSettings(prev => ({ ...prev, maxApplicationsPerStudent: Math.max(0, parseInt(e.target.value) || 0) }))}
            className="w-32 bauhaus-input" id="max-applications-input" />
        </div>

        <div>
          <label className="block text-sm font-black text-bauhaus-black mb-1 uppercase">Global Minimum CGPA</label>
          <p className="text-xs text-bauhaus-black/50 mb-2 font-medium">Floor CGPA for all jobs. Overrides individual job settings if this is higher. Set to 0 to disable.</p>
          <input type="number" min="0" max="10" step="0.1" value={settings.minCGPAOverride}
            onChange={(e) => setSettings(prev => ({ ...prev, minCGPAOverride: Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)) }))}
            className="w-32 bauhaus-input" id="min-cgpa-input" />
        </div>
      </div>

      {/* ─── Contact Information ─── */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm space-y-5">
        <h2 className="text-lg font-black text-bauhaus-black mb-2 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2 flex items-center gap-2">
          <Mail className="w-5 h-5" /> Contact Information
        </h2>
        <p className="text-xs text-bauhaus-black/50 font-medium -mt-2">
          This information is displayed on the public Contact Us page. The contact email also receives form submissions.
        </p>

        <div>
          <label className="block text-sm font-black text-bauhaus-black mb-1 uppercase">Contact Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bauhaus-black/30" />
            <input type="email" value={settings.contactEmail || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
              className="bauhaus-input pl-10 w-full" placeholder="admin@pms.com" id="contact-email-input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-black text-bauhaus-black mb-1 uppercase">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bauhaus-black/30" />
            <input type="text" value={settings.phone || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
              className="bauhaus-input pl-10 w-full" placeholder="+91 98765 43210" id="phone-input" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-black text-bauhaus-black mb-1 uppercase">Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-bauhaus-black/30" />
            <textarea value={settings.address || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
              className="bauhaus-input pl-10 w-full min-h-[80px] resize-y" placeholder="123 University Road, City, State - 000000" id="address-input" />
          </div>
        </div>
      </div>

      {/* Metadata */}
      {settings.lastUpdatedBy && (
        <div className="text-xs text-bauhaus-black/30 text-center font-bold uppercase tracking-wider">
          Last updated by <span className="text-bauhaus-black/50">{settings.lastUpdatedBy.name}</span>
          {settings.updatedAt && ` on ${new Date(settings.updatedAt).toLocaleString()}`}
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-3 bg-bauhaus-red text-white font-black hover:opacity-90 transition-all disabled:opacity-60 flex items-center gap-2 border-4 border-bauhaus-black shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider"
          id="save-settings-btn">
          <Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default PlacementSettings;
