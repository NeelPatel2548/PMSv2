import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-bauhaus-white">
      <div className="text-center max-w-md">
        {/* Geometric decoration */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-full bg-bauhaus-red border-4 border-bauhaus-black" />
          <div className="w-16 h-16 bg-bauhaus-blue border-4 border-bauhaus-black" />
          <div className="w-0 h-0 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[56px] border-b-bauhaus-yellow" />
        </div>
        <h1 className="text-9xl font-black text-bauhaus-black mb-3">404</h1>
        <p className="text-xl font-black text-bauhaus-black mb-2 uppercase tracking-widest">Page Not Found</p>
        <p className="text-bauhaus-black/60 mb-10 leading-relaxed font-medium">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link to="/"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-bauhaus-red text-white font-bold border-2 border-bauhaus-black shadow-hard-md hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider">
          <Home className="w-4 h-4" /> Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
