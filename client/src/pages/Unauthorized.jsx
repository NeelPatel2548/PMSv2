import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-8">You don&apos;t have permission to access this page.</p>
        <Link to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Link>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
