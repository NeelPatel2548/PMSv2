import { Link } from 'react-router-dom';
import { ArrowRight, Users, Building2, Briefcase, TrendingUp, Trophy, FileCheck, Target, ShieldCheck, BarChart2, Calendar, Zap, Activity, UserPlus, Search, Rocket } from 'lucide-react';
import { topRecruiters, testimonials, placementStats, howItWorks, features } from '../data/landingData';

const iconMap = {
  'trending-up': TrendingUp, 'indian-rupee': Trophy, trophy: Trophy,
  'building-2': Building2, users: Users, 'file-check': FileCheck,
  'user-plus': UserPlus, 'shield-check': ShieldCheck, search: Search,
  rocket: Rocket, zap: Zap, activity: Activity,
  'bar-chart-2': BarChart2, calendar: Calendar, target: Target,
};

const bauhausColors = ['bg-bauhaus-red', 'bg-bauhaus-blue', 'bg-bauhaus-yellow', 'bg-bauhaus-black'];
const bauhausTextColors = ['text-white', 'text-white', 'text-bauhaus-black', 'text-white'];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-bauhaus-white font-bauhaus">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[85vh]">
          {/* Left — Text */}
          <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-16 lg:py-0">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-4 h-4 rounded-full bg-bauhaus-red" />
              <div className="w-4 h-4 bg-bauhaus-blue" />
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-bauhaus-yellow" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-bauhaus-black/50 ml-2">Placement Management System</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase leading-[0.95] text-bauhaus-black mb-6">
              Your<br />
              <span className="text-bauhaus-red">Placement</span><br />
              Journey<br />
              Starts Here
            </h1>
            <p className="text-lg text-bauhaus-black/60 font-medium max-w-lg mb-10 leading-relaxed">
              The complete platform connecting students, companies, and placement officers. Apply, track, and get placed — all in one system.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-bauhaus-red text-white font-black border-4 border-bauhaus-black shadow-hard-lg hover:opacity-90 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider text-sm">
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-bauhaus-black font-black border-4 border-bauhaus-black shadow-hard-lg hover:bg-bauhaus-muted active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider text-sm">
                Login
              </Link>
            </div>
          </div>
          {/* Right — Geometric composition */}
          <div className="flex-1 bg-bauhaus-blue relative hidden lg:flex items-center justify-center overflow-hidden">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-bauhaus-red border-4 border-white/20" />
            <div className="absolute bottom-20 left-10 w-32 h-32 bg-bauhaus-yellow border-4 border-white/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[80px] border-l-transparent border-r-[80px] border-r-transparent border-b-[140px] border-b-white/20" />
            <div className="absolute bottom-10 right-20 w-24 h-24 rounded-full border-4 border-white/30" />
            <div className="absolute top-20 left-20 w-20 h-20 border-4 border-bauhaus-yellow/60" />
            {/* Center text */}
            <div className="relative z-10 text-center">
              <p className="text-8xl font-black text-white/20 uppercase">PMS</p>
              <p className="text-sm font-bold text-white/50 uppercase tracking-[0.5em] mt-2">v2.0</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <section className="bg-bauhaus-yellow border-y-4 border-bauhaus-black">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {placementStats.map((stat, i) => {
              const Icon = iconMap[stat.icon] || TrendingUp;
              return (
                <div key={i} className="text-center">
                  <Icon className="w-6 h-6 mx-auto mb-2 text-bauhaus-black/60" />
                  <p className="text-3xl font-black text-bauhaus-black">{stat.value}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-bauhaus-black/60 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ TOP RECRUITERS MARQUEE ═══════════════ */}
      <section className="py-16 bg-bauhaus-white border-b-4 border-bauhaus-black">
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-bauhaus-black text-center">
            Top <span className="text-bauhaus-blue">Recruiters</span>
          </h2>
          <p className="text-center text-bauhaus-black/50 font-medium mt-2 uppercase tracking-wider text-sm">Companies that hire from our campus</p>
        </div>
        <div className="overflow-hidden">
          <div className="marquee-track-left">
            {[...topRecruiters, ...topRecruiters].map((r, i) => (
              <div key={`${r.id}-${i}`} className="flex-shrink-0 mx-2 w-56 bg-white border-4 border-bauhaus-black p-4 shadow-hard-sm">
                <div className="w-12 h-12 bg-bauhaus-black text-white flex items-center justify-center text-xl font-black mb-3">
                  {r.logo}
                </div>
                <p className="font-black text-bauhaus-black uppercase text-sm">{r.name}</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-bold text-bauhaus-black/60">
                  <span>📦 {r.package}</span>
                  <span>👥 {r.hired} hired</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-20 bg-bauhaus-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-white text-center mb-4">
            How It <span className="text-bauhaus-yellow">Works</span>
          </h2>
          <p className="text-center text-white/40 font-medium mb-16 uppercase tracking-wider text-sm">Four simple steps to your dream placement</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => {
              const Icon = iconMap[item.icon] || Zap;
              const bgColor = bauhausColors[i % 4];
              const txtColor = bauhausTextColors[i % 4];
              return (
                <div key={i} className="bg-white border-4 border-white p-6 relative group">
                  {/* Step number */}
                  <div className={`w-12 h-12 ${bgColor} ${txtColor} flex items-center justify-center text-lg font-black mb-4 border-2 border-bauhaus-black`}>
                    {item.step}
                  </div>
                  <h3 className="text-lg font-black uppercase text-bauhaus-black mb-2">{item.title}</h3>
                  <p className="text-sm text-bauhaus-black/60 font-medium leading-relaxed">{item.description}</p>
                  {/* Connector line on lg */}
                  {i < 3 && <div className="hidden lg:block absolute top-10 -right-3 w-6 h-1 bg-bauhaus-yellow" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-20 bg-bauhaus-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-bauhaus-black text-center mb-4">
            Powerful <span className="text-bauhaus-red">Features</span>
          </h2>
          <p className="text-center text-bauhaus-black/50 font-medium mb-16 uppercase tracking-wider text-sm">Everything you need for successful placements</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = iconMap[feat.icon] || Zap;
              const bgColor = bauhausColors[i % 4];
              const txtColor = bauhausTextColors[i % 4];
              return (
                <div key={i} className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-md hover:-translate-y-1 transition-transform">
                  <div className={`w-14 h-14 ${bgColor} ${txtColor} flex items-center justify-center mb-4 border-2 border-bauhaus-black`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black uppercase text-bauhaus-black mb-2">{feat.title}</h3>
                  <p className="text-sm text-bauhaus-black/60 font-medium leading-relaxed mb-3">{feat.description}</p>
                  <span className="inline-block px-3 py-1 bg-bauhaus-yellow text-bauhaus-black text-xs font-bold border-2 border-bauhaus-black uppercase tracking-wider">
                    {feat.highlight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-20 bg-bauhaus-muted border-y-4 border-bauhaus-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-black uppercase text-bauhaus-black text-center mb-4">
            Student <span className="text-bauhaus-blue">Stories</span>
          </h2>
          <p className="text-center text-bauhaus-black/50 font-medium mb-16 uppercase tracking-wider text-sm">Hear from our placed students</p>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => {
              const bgColor = bauhausColors[i % 4];
              const txtColor = bauhausTextColors[i % 4];
              return (
                <div key={t.id} className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-md">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 ${bgColor} ${txtColor} flex items-center justify-center text-xl font-black border-2 border-bauhaus-black`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-black text-bauhaus-black uppercase">{t.name}</p>
                      <p className="text-xs font-bold text-bauhaus-black/50 uppercase tracking-wider">{t.role}</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-bauhaus-yellow text-bauhaus-black text-xs font-black border-2 border-bauhaus-black">
                      {t.package}
                    </span>
                  </div>
                  <p className="text-sm text-bauhaus-black/70 font-medium leading-relaxed italic">"{t.quote}"</p>
                  <div className="flex gap-2 mt-4">
                    <span className="px-2 py-0.5 bg-bauhaus-muted text-bauhaus-black text-[10px] font-bold border border-bauhaus-black uppercase">
                      {t.branch}
                    </span>
                    <span className="px-2 py-0.5 bg-bauhaus-muted text-bauhaus-black text-[10px] font-bold border border-bauhaus-black uppercase">
                      Batch {t.batch}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="py-20 bg-bauhaus-yellow border-b-4 border-bauhaus-black relative overflow-hidden">
        {/* Geometric decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-bauhaus-red/20" />
        <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-bauhaus-blue/20" />
        <div className="absolute top-10 right-10 w-20 h-20 border-4 border-bauhaus-black/20" />

        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-bauhaus-black mb-6">
            Ready to Get<br />Placed?
          </h2>
          <p className="text-lg text-bauhaus-black/60 font-medium mb-10 max-w-xl mx-auto">
            Join thousands of students who have already found their dream jobs through our platform. Start your journey today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-10 py-4 bg-bauhaus-black text-white font-black border-4 border-bauhaus-black shadow-hard-lg hover:opacity-90 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider">
              Create Account <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-bauhaus-black font-black border-4 border-bauhaus-black shadow-hard-lg hover:bg-bauhaus-muted active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wider">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-bauhaus-black border-t-4 border-bauhaus-yellow py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-bauhaus-red" />
                <div className="w-3 h-3 bg-bauhaus-blue" />
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-bauhaus-yellow" />
              </div>
              <span className="text-white font-black uppercase tracking-tight">PMS</span>
              <span className="text-white/30 text-xs font-bold">v2.0</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link to="/login" className="text-white/50 hover:text-white font-bold uppercase tracking-wider transition-colors">Student</Link>
              <Link to="/login" className="text-white/50 hover:text-white font-bold uppercase tracking-wider transition-colors">Company</Link>
              <Link to="/login" className="text-white/50 hover:text-white font-bold uppercase tracking-wider transition-colors">Admin</Link>
            </div>
            <p className="text-white/30 text-xs font-bold uppercase tracking-wider">
              © {new Date().getFullYear()} Placement Management System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
