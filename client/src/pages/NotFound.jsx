import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-100/50">
          <FileQuestion className="w-12 h-12 text-indigo-500" />
        </div>
        <h1 className="text-8xl font-extrabold gradient-text mb-3">404</h1>
        <p className="text-xl font-bold text-slate-900 mb-2">Page Not Found</p>
        <p className="text-slate-500 mb-10 leading-relaxed">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link to="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
          <Home className="w-4 h-4" /> Go Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
