import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, IndianRupee, Trophy, Building2, Users, FileCheck,
  UserPlus, ShieldCheck, Search, Rocket, Zap, Activity, BarChart2,
  Calendar, Target, ArrowRight, Star, ChevronLeft, ChevronRight,
  CheckCircle2, Sparkles, GraduationCap, Mail, MapPin, Phone, Github, Linkedin
} from 'lucide-react';
import { topRecruiters, testimonials, placementStats, howItWorks, features } from '../data/landingData';
import api from '../services/api';

/* ═══════ Icon Map ═══════ */
const iconMap = {
  'trending-up': TrendingUp, 'indian-rupee': IndianRupee, 'trophy': Trophy,
  'building-2': Building2, 'users': Users, 'file-check': FileCheck,
  'user-plus': UserPlus, 'shield-check': ShieldCheck, 'search': Search,
  'rocket': Rocket, 'zap': Zap, 'activity': Activity, 'bar-chart-2': BarChart2,
  'calendar': Calendar, 'target': Target,
};

/* ═══════ Animated Counter ═══════ */
const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [display, setDisplay] = useState('0');
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const numericMatch = String(value).match(/[\d.]+/);
      if (!numericMatch) { setDisplay(String(value)); return; }
      const end = parseFloat(numericMatch[0]);
      const prefix = String(value).slice(0, String(value).indexOf(numericMatch[0]));
      const suffix = String(value).slice(String(value).indexOf(numericMatch[0]) + numericMatch[0].length);
      const isFloat = numericMatch[0].includes('.');
      const startTime = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * end;
        setDisplay(`${prefix}${isFloat ? current.toFixed(1) : Math.round(current)}${suffix}`);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
};

/* ═══════ MAIN COMPONENT ═══════ */
const LandingPage = () => {
  const navigate = useNavigate();
  const [liveStats, setLiveStats] = useState({ students: 0, companies: 0, jobs: 0, rate: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const testimonialTimer = useRef(null);

  // Live API stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/public/stats');
        if (res.data.success) {
          const s = res.data.data;
          setLiveStats({
            students: s.totalStudents || 0,
            companies: s.totalCompanies || 0,
            jobs: s.activeJobs || 0,
            rate: s.placementRate || 0,
          });
        }
      } catch { /* silent */ }
    };
    fetchStats();
  }, []);

  // Testimonial auto-advance
  useEffect(() => {
    if (isPaused) return;
    testimonialTimer.current = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(testimonialTimer.current);
  }, [isPaused]);

  const nextTestimonial = useCallback(() => setCurrentTestimonial(prev => (prev + 1) % testimonials.length), []);
  const prevTestimonial = useCallback(() => setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length), []);

  const doubledRecruiters = [...topRecruiters, ...topRecruiters];

  const liveStatItems = [
    { label: 'Total Students', value: liveStats.students, icon: Users, color: 'text-indigo-600' },
    { label: 'Companies', value: liveStats.companies, icon: Building2, color: 'text-purple-600' },
    { label: 'Active Jobs', value: liveStats.jobs, icon: Zap, color: 'text-emerald-600' },
    { label: 'Placement Rate', value: `${liveStats.rate}%`, icon: TrendingUp, color: 'text-amber-600' },
  ];

  const t = testimonials[currentTestimonial];

  return (
    <div className="w-full min-h-screen overflow-x-hidden">

      {/* ═══════════ SECTION 2 — HERO ═══════════ */}
      <section className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center">
        {/* Orbs — pure CSS */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full px-4 py-2 text-sm mb-8 relative overflow-hidden">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>🎓 Trusted by 500+ students across batches</span>
            <div className="absolute inset-0 rounded-full shimmer pointer-events-none" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Your Bridge to{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Career Success
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect students with top companies. Streamline campus placements with smart eligibility matching,
            interview scheduling, and real-time tracking.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/register"
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2">
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how-it-works"
              className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-200">
              Watch How It Works
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            {['Free for students', 'Verified companies only', 'Real-time updates'].map(badge => (
              <span key={badge} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />{badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 3 — LIVE STATS BAR ═══════════ */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 -mt-20">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {liveStatItems.map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  <AnimatedNumber value={s.value} />
                </p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ SECTION 4 — PLACEMENT STATISTICS ═══════════ */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Our Track Record</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Numbers that speak for themselves — our consistent placement results year after year.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {placementStats.map(stat => {
              const Icon = iconMap[stat.icon] || TrendingUp;
              return (
                <div key={stat.label}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-800">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 5 — TOP RECRUITERS MARQUEE ═══════════ */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Our Top Recruiters & Partners</h2>
            <p className="text-slate-500">50+ companies actively hiring through our platform</p>
          </div>
        </div>
        {/* Row 1 — scrolls left */}
        <div className="relative mb-5 overflow-hidden">
          <div className="marquee-track-left">
            {doubledRecruiters.map((r, i) => (
              <div key={`l-${i}`} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mx-2 min-w-[160px] flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                  {r.logo}
                </div>
                <p className="font-semibold text-sm text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500">Avg: {r.package}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">{r.hired} hired</span>
              </div>
            ))}
          </div>
        </div>
        {/* Row 2 — scrolls right */}
        <div className="relative overflow-hidden">
          <div className="marquee-track-right">
            {doubledRecruiters.map((r, i) => (
              <div key={`r-${i}`} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mx-2 min-w-[160px] flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                  {r.logo}
                </div>
                <p className="font-semibold text-sm text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500">Avg: {r.package}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">{r.hired} hired</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 6 — HOW IT WORKS ═══════════ */}
      <section className="py-24 px-6 bg-slate-50" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">How It Works</h2>
            <p className="text-slate-500">Get placed in 4 simple steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line (hidden on mobile) */}
            <div className="hidden md:block absolute top-14 left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-dashed border-slate-300" />
            {howItWorks.map(step => {
              const Icon = iconMap[step.icon] || Rocket;
              return (
                <div key={step.step} className="relative text-center">
                  <p className="text-5xl font-extrabold bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
                    {step.step}
                  </p>
                  <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 7 — FEATURES GRID ═══════════ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Everything You Need</h2>
            <p className="text-slate-500">Built for students, companies, and placement officers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => {
              const Icon = iconMap[f.icon] || Zap;
              const colorClasses = f.color.split(' ');
              return (
                <div key={f.title}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
                  <div className={`w-12 h-12 rounded-xl ${colorClasses[0]} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${colorClasses[1]}`} />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{f.description}</p>
                  <span className="inline-block bg-indigo-50 text-indigo-600 text-xs rounded-full px-3 py-1 font-medium">
                    {f.highlight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 8 — TESTIMONIALS ═══════════ */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">Success Stories</h2>
            <p className="text-slate-500">Hear from our placed students</p>
          </div>

          <div className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}>
            {/* Slider */}
            <div className="overflow-hidden rounded-2xl">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 transition-all duration-500">
                {/* Quote mark */}
                <span className="text-5xl font-serif text-indigo-200 leading-none select-none">&ldquo;</span>
                <p className="text-lg text-slate-700 italic leading-relaxed mb-6 -mt-4">
                  {t.quote}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role} • Batch {t.batch} • {t.branch}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                      Package: {t.package}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrows */}
            <button onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 hidden sm:flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all z-10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 hidden sm:flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all z-10">
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrentTestimonial(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === currentTestimonial ? 'w-8 bg-indigo-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 9 — CTA BANNER ═══════════ */}
      <section className="relative py-24 px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white/5 blur-[60px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-white/5 blur-[60px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Launch Your Career?
          </h2>
          <p className="text-indigo-200 mb-10 text-lg">
            Join hundreds of students who've already secured their dream placements through our platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link to="/register"
              className="px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-semibold hover:bg-indigo-50 hover:-translate-y-0.5 transition-all shadow-lg flex items-center gap-2">
              Register as Student <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register"
              className="px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold hover:bg-white/10 hover:border-white/50 transition-all">
              Register as Company
            </Link>
          </div>
          <p className="text-sm text-indigo-300">Join 500+ students already placed</p>
        </div>
      </section>

      {/* ═══════════ SECTION 10 — FOOTER ═══════════ */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 mb-12">
          {/* Column 1 — Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">PMS</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              The complete Placement Management System connecting top talent with leading companies. Built for students, by students.
            </p>
            <div className="flex gap-3">
              {[Github, Linkedin, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[{ label: 'Home', to: '/' }, { label: 'Login', to: '/login' }, { label: 'Register', to: '/register' }].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: 'University Campus, Main Building' },
                { icon: Mail, text: 'placements@university.edu' },
                { icon: Phone, text: '+91 12345 67890' },
              ].map(item => (
                <li key={item.text} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <item.icon className="w-4 h-4 text-slate-500 flex-shrink-0" />{item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-800 pt-6">
          <p className="text-center text-xs text-slate-500">© {new Date().getFullYear()} Placement Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
