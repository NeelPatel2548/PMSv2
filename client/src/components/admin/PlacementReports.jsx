import { useState, useEffect } from 'react';
import { PlusCircle, FileText, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import Loader from '../common/Loader';

const currentYear = new Date().getFullYear();
// Generate year options like "2023-24", "2024-25", etc.
const yearOptions = Array.from({ length: 6 }, (_, i) => {
  const y = currentYear - 3 + i;
  return `${y}-${String(y + 1).slice(-2)}`;
});

const PlacementReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [academicYear, setAcademicYear] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleting, setDeleting] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      if (res.data.success) setReports(res.data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const generateReport = async () => {
    if (!academicYear) return setMessage({ type: 'error', text: 'Select an academic year' });
    setGenerating(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post('/admin/reports', { academicYear });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Report generated!' });
        fetchReports();
        setAcademicYear('');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' });
    } finally { setGenerating(false); }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await api.delete(`/admin/reports/${id}`);
      if (res.data.success) {
        setReports(prev => prev.filter(r => r._id !== id));
        setMessage({ type: 'success', text: 'Report deleted' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete' });
    } finally { setDeleting(null); }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-bauhaus-black mb-1 uppercase tracking-wider">Placement Reports</h1>
        <p className="text-bauhaus-black/50 text-sm font-medium">Generate and view placement reports by academic year</p>
      </div>

      {/* Generate */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
        <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Generate New Report</h2>
        {message.text && (
          <div className={`mb-3 p-2 text-sm font-bold border-2 border-bauhaus-black ${message.type === 'success' ? 'bg-bauhaus-yellow text-bauhaus-black' : 'bg-bauhaus-red text-white'}`}>{message.text}</div>
        )}
        <div className="flex gap-3">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bauhaus-input flex-1"
            id="academic-year-select"
          >
            <option value="">Select Academic Year</option>
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button onClick={generateReport} disabled={generating}
            className="px-4 py-2 bg-bauhaus-blue text-white text-sm font-black border-2 border-bauhaus-black hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60 uppercase">
            <PlusCircle className="w-4 h-4" />{generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Reports */}
      {reports.length === 0 ? (
        <div className="text-center py-16 text-bauhaus-black/40">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-bold uppercase">No reports generated yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <div key={report._id} className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm border-l-8 border-l-bauhaus-blue">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-bauhaus-black uppercase">Academic Year: {report.academicYear}</h3>
                  <p className="text-xs text-bauhaus-black/30 font-bold">Generated: {new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => deleteReport(report._id)}
                  disabled={deleting === report._id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-bauhaus-red/10 text-bauhaus-red text-xs font-black hover:bg-bauhaus-red hover:text-white border-2 border-bauhaus-red transition disabled:opacity-50 uppercase"
                  id={`delete-report-${report._id}`}
                >
                  <Trash2 className="w-3 h-3" />
                  {deleting === report._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Students', value: report.totalStudents, color: 'bg-bauhaus-blue text-white' },
                  { label: 'Placed', value: report.totalPlaced, color: 'bg-bauhaus-yellow text-bauhaus-black' },
                  { label: 'Avg Package', value: report.avgPackage && report.avgPackage > 0 ? `${report.avgPackage.toFixed(1)} LPA` : 'N/A', color: 'bg-bauhaus-red text-white' },
                  { label: 'Max Package', value: report.maxPackage && report.maxPackage > 0 ? `${report.maxPackage.toFixed(1)} LPA` : 'N/A', color: 'bg-bauhaus-black text-white' },
                ].map(s => (
                  <div key={s.label} className={`p-3 border-2 border-bauhaus-black ${s.color}`}>
                    <p className="text-xl font-black">{s.value}</p>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">{s.label}</p>
                  </div>
                ))}
              </div>

              {report.branchWiseStats?.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={report.branchWiseStats.filter(b => b.total > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis dataKey="branch" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ border: '2px solid #1A1A1A', borderRadius: '0', boxShadow: '3px 3px 0 #1A1A1A', fontSize: '12px', fontWeight: 700 }} />
                    <Bar dataKey="total" fill="#E5E5E5" name="Total" radius={0} />
                    <Bar dataKey="placed" fill="#1A1A1A" name="Placed" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacementReports;
