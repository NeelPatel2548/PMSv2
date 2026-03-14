import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-10 h-10 text-slate-500" />
        </div>
        <h1 className="text-6xl font-extrabold text-slate-800 mb-2">404</h1>
        <p className="text-xl font-semibold text-slate-600 mb-2">Page Not Found</p>
        <p className="text-slate-400 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
          <Home className="w-4 h-4" /> Go Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
