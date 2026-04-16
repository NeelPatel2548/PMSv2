import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertTriangle, ArrowLeft, Building2, User, MessageSquare, FileText } from 'lucide-react';
import api from '../services/api';

const ContactUs = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Fetch public settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/public/settings');
        if (res.data.success) setSettings(res.data.data);
      } catch {
        // Use defaults
        setSettings({
          companyName: 'Placement Management System',
          contactEmail: 'admin@pms.com',
          phone: '',
          address: ''
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Validate
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('All fields are required');
      return;
    }
    if (form.message.trim().length < 10) {
      setError('Message must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/public/contact', form);
      if (res.data.success) {
        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bauhaus-white">
        <div className="w-10 h-10 border-4 border-bauhaus-black border-t-bauhaus-red animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bauhaus-white">
      {/* Navigation Bar */}
      <nav className="bg-bauhaus-black border-b-4 border-bauhaus-yellow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-bauhaus-red border border-white/20" />
              <div className="w-4 h-4 bg-bauhaus-blue border border-white/20" />
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-bauhaus-yellow" />
            </div>
            <span className="text-white font-black uppercase tracking-tight text-lg group-hover:text-bauhaus-yellow transition-colors">PMS</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white/60 text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Home
            </Link>
            <Link to="/login" className="px-4 py-2 bg-bauhaus-blue text-white text-sm font-black uppercase tracking-wider border-2 border-bauhaus-blue hover:opacity-90 transition">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-6 h-6 rounded-full bg-bauhaus-red border-2 border-bauhaus-black" />
            <div className="w-6 h-6 bg-bauhaus-blue border-2 border-bauhaus-black" />
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[21px] border-b-bauhaus-yellow" />
          </div>
          <h1 className="text-4xl font-black text-bauhaus-black uppercase tracking-wider">Contact Us</h1>
          <p className="text-bauhaus-black/50 mt-3 text-lg font-medium max-w-xl mx-auto">
            Have a question about placements? Need help with your account? We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization Info Card */}
            <div className="bg-bauhaus-black text-white p-6 border-4 border-bauhaus-black shadow-hard-sm">
              <h2 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-2 border-b-2 border-bauhaus-yellow pb-3">
                <Building2 className="w-5 h-5 text-bauhaus-yellow" />
                Get in Touch
              </h2>

              <div className="space-y-5">
                {settings?.contactEmail && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-bauhaus-red flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-white/50 mb-1">Email</p>
                      <a href={`mailto:${settings.contactEmail}`} className="text-bauhaus-yellow hover:text-white transition-colors font-bold">
                        {settings.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-bauhaus-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-white/50 mb-1">Phone</p>
                      <a href={`tel:${settings.phone}`} className="text-white hover:text-bauhaus-yellow transition-colors font-bold">
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                )}

                {settings?.address && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-bauhaus-yellow flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5 text-bauhaus-black" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-white/50 mb-1">Address</p>
                      <p className="text-white/80 font-medium whitespace-pre-line">{settings.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white p-6 border-4 border-bauhaus-black shadow-hard-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-bauhaus-black mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/login" className="block text-sm font-bold text-bauhaus-blue hover:text-bauhaus-red transition-colors uppercase tracking-wider">
                  → Student Login
                </Link>
                <Link to="/register" className="block text-sm font-bold text-bauhaus-blue hover:text-bauhaus-red transition-colors uppercase tracking-wider">
                  → Create Account
                </Link>
                <Link to="/" className="block text-sm font-bold text-bauhaus-blue hover:text-bauhaus-red transition-colors uppercase tracking-wider">
                  → Back to Home
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-3">
            {submitted ? (
              /* Success State */
              <div className="bg-white p-10 border-4 border-bauhaus-black shadow-hard-sm text-center">
                <div className="w-16 h-16 bg-bauhaus-yellow mx-auto flex items-center justify-center border-2 border-bauhaus-black mb-6">
                  <CheckCircle className="w-8 h-8 text-bauhaus-black" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wider text-bauhaus-black mb-3">Message Sent!</h3>
                <p className="text-bauhaus-black/60 font-medium mb-6">
                  Thank you for reaching out. We've received your message and will get back to you as soon as possible.
                  A confirmation email has been sent to your address.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 bg-bauhaus-blue text-white font-black uppercase tracking-wider border-2 border-bauhaus-black shadow-hard-sm hover:opacity-90 transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    Send Another
                  </button>
                  <Link to="/"
                    className="px-6 py-3 bg-bauhaus-black text-white font-black uppercase tracking-wider border-2 border-bauhaus-black shadow-hard-sm hover:opacity-90 transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    Go Home
                  </Link>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="bg-white p-8 border-4 border-bauhaus-black shadow-hard-sm space-y-5">
                <h2 className="text-lg font-black text-bauhaus-black uppercase tracking-wider border-b-2 border-bauhaus-black pb-3 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Send a Message
                </h2>

                {error && (
                  <div className="p-3 bg-bauhaus-red text-white text-sm border-2 border-bauhaus-black font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-2">Your Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bauhaus-black/30" />
                    <input
                      type="text" name="name" value={form.name} onChange={handleChange}
                      className="bauhaus-input pl-10 w-full" placeholder="John Doe" required
                      id="contact-name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-2">Your Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bauhaus-black/30" />
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      className="bauhaus-input pl-10 w-full" placeholder="you@example.com" required
                      id="contact-email"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-2">Subject *</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bauhaus-black/30" />
                    <input
                      type="text" name="subject" value={form.subject} onChange={handleChange}
                      className="bauhaus-input pl-10 w-full" placeholder="Inquiry about placement drives" required
                      id="contact-subject"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-2">Message *</label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    className="bauhaus-input w-full min-h-[140px] resize-y" placeholder="Your message... (minimum 10 characters)" required minLength={10}
                    id="contact-message"
                  />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-4 bg-bauhaus-red text-white font-black border-4 border-bauhaus-black shadow-hard-sm hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all uppercase tracking-wider text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  id="contact-submit-btn"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-bauhaus-black text-white py-6 mt-12 border-t-4 border-bauhaus-yellow">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/40 text-sm font-bold uppercase tracking-wider">
            © {new Date().getFullYear()} {settings?.companyName || 'Placement Management System'}. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
