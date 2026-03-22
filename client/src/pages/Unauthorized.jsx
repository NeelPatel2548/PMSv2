import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-100/50">
          <ShieldOff className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-7xl font-extrabold text-red-500 mb-3">403</h1>
        <p className="text-xl font-bold text-slate-900 mb-2">Access Denied</p>
        <p className="text-slate-500 mb-10 leading-relaxed">You don&apos;t have permission to access this page.</p>
        <Link to="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Link>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
