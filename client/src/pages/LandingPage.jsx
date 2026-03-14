import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, Briefcase, TrendingUp, Users, Award, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../services/api';

const LandingPage = () => {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, compRes] = await Promise.all([
          api.get('/public/stats'),
          api.get('/public/companies')
        ]);
        if (statsRes.data.success) setStats(statsRes.data.data);
        if (compRes.data.success) setCompanies(compRes.data.data);
      } catch { /* ignore */ }
    };
    fetchData();
  }, []);

  const features = [
    { icon: Briefcase, title: 'Smart Job Matching', desc: 'Auto-filtered jobs based on CGPA, branch, and backlogs' },
    { icon: Building2, title: 'Company Portal', desc: 'Post jobs, manage applicants, schedule interviews' },
    { icon: TrendingUp, title: 'Real-time Tracking', desc: 'Track applications from applied to offer' },
    { icon: Award, title: 'Placement Reports', desc: 'Branch-wise analytics and placement statistics' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              Placement Management System
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Your Bridge to
              <span className="block bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                Career Success
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto">
              Connect students with top companies. Streamline campus placements with smart eligibility matching, interview scheduling, and real-time tracking.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-primary-700 font-semibold hover:bg-slate-50 transition-all shadow-lg shadow-black/10 text-sm">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all border border-white/20 text-sm">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Students', value: stats.totalStudents, icon: Users },
                { label: 'Placed', value: stats.placedStudents, icon: Award },
                { label: 'Companies', value: stats.totalCompanies, icon: Building2 },
                { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100">
                  <s.icon className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                  <p className="text-3xl font-bold text-slate-800">{s.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Why PMS?</h2>
            <p className="text-slate-500 mt-2 max-w-lg mx-auto">Everything you need to manage campus placements efficiently.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors">
                  <f.icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies */}
      {companies.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">Our Recruiting Partners</h2>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {companies.map(c => (
                <div key={c._id} className="px-6 py-3 bg-white rounded-xl border border-slate-100 text-sm font-medium text-slate-600 shadow-sm">
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-indigo-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start?</h2>
          <p className="text-white/80 mb-8">Create your account and take the first step towards your dream career.</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-primary-700 font-semibold hover:bg-slate-50 transition-all shadow-lg text-sm">
            Register Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-center">
        <p className="text-slate-400 text-sm">© {new Date().getFullYear()} PMS — Placement Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
