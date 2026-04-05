import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PlusCircle, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import Loader from '../common/Loader';

const PlacementReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [academicYear, setAcademicYear] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      if (res.data.success) setReports(res.data.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, []);

  const generateReport = async () => {
    if (!academicYear) return setMessage({ type: 'error', text: 'Enter academic year' });
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

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Placement Reports</h1>
        <p className="text-slate-500 text-sm">Generate and view placement reports by academic year</p>
      </motion.div>

      {/* Generate */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Generate New Report</h2>
        {message.text && (
          <div className={`mb-3 p-2 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{message.text}</div>
        )}
        <div className="flex gap-3">
          <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g. 2024-25" className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" />
          <button onClick={generateReport} disabled={generating}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-60 shadow-sm">
            <PlusCircle className="w-4 h-4" />{generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Reports */}
      {reports.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No reports generated yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report, i) => (
            <motion.div key={report._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm border-l-4 border-l-indigo-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Academic Year: {report.academicYear}</h3>
                  <p className="text-xs text-slate-400">Generated: {new Date(report.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-blue-50">
                  <p className="text-xl font-bold text-blue-700">{report.totalStudents}</p>
                  <p className="text-xs text-blue-500">Total Students</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50">
                  <p className="text-xl font-bold text-green-700">{report.totalPlaced}</p>
                  <p className="text-xs text-green-500">Placed</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50">
                  <p className="text-xl font-bold text-amber-700">{report.avgPackage?.toFixed(1) || 0} LPA</p>
                  <p className="text-xs text-amber-500">Avg Package</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50">
                  <p className="text-xl font-bold text-purple-700">{report.maxPackage || 0} LPA</p>
                  <p className="text-xs text-purple-500">Max Package</p>
                </div>
              </div>

              {report.branchWiseStats?.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={report.branchWiseStats.filter(b => b.total > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '12px' }} />
                    <Bar dataKey="total" fill="#e2e8f0" name="Total" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="placed" fill="#6366f1" name="Placed" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacementReports;
