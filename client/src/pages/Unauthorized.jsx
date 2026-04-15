import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-bauhaus-white">
      <div className="text-center max-w-md">
        {/* Geometric decoration */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 bg-bauhaus-red border-4 border-bauhaus-black flex items-center justify-center">
            <ShieldOff className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-9xl font-black text-bauhaus-red mb-3">403</h1>
        <p className="text-xl font-black text-bauhaus-black mb-2 uppercase tracking-widest">Access Denied</p>
        <p className="text-bauhaus-black/60 mb-10 leading-relaxed font-medium">You don&apos;t have permission to access this page.</p>
        <Link to="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-bauhaus-blue text-white font-bold border-2 border-bauhaus-black shadow-hard-md hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
