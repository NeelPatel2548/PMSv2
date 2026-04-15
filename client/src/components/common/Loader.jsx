const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      {/* Geometric shapes with staggered pulse */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-bauhaus-red border-2 border-bauhaus-black bauhaus-loader-circle" />
        <div className="w-8 h-8 bg-bauhaus-blue border-2 border-bauhaus-black bauhaus-loader-square" />
        <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-bauhaus-yellow bauhaus-loader-triangle" />
      </div>
      <p className="text-sm font-black uppercase tracking-[0.3em] text-bauhaus-black/50">Loading</p>
    </div>
  );
};

export default Loader;
