import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import {
  ShieldCheck, User, Mail, Lock, Phone, AlertCircle,
  Clock, CheckCircle2, ArrowLeft, ClipboardCheck,
} from 'lucide-react';

// ─── localStorage helpers ───────────────────────────────────────────────────
const PENDING_KEY = 'ecare_pending_registrations';

function addPendingRegistration(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
    // avoid duplicates by email
    const filtered = existing.filter((e) => e.email !== entry.email);
    filtered.unshift({ ...entry, registeredAt: new Date().toISOString() });
    localStorage.setItem(PENDING_KEY, JSON.stringify(filtered));
  } catch {/* ignore */}
}
// ────────────────────────────────────────────────────────────────────────────

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phoneNumber: '',
    role: 'RESEARCHER',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // shows pending screen
  const [submittedName, setSubmittedName] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.register(formData);
      if (res.data.success) {
        // Save to localStorage so admin sees it in the approval queue
        addPendingRegistration({
          userId: res.data.data?.userId || '',
          email: formData.email,
          fullName: `${formData.firstName} ${formData.lastName}`,
          username: formData.username,
          role: formData.role,
          phone: formData.phoneNumber,
        });
        setSubmittedName(`${formData.firstName} ${formData.lastName}`);
        setSubmitted(true);
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account. Check if email/username already exists.');
    } finally {
      setLoading(false);
    }
  };

  // ── Pending Approval Screen ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '480px',
          padding: '48px 36px',
          textAlign: 'center',
        }}>
          {/* Animated clock icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(251,191,36,0.15) 100%)',
            border: '2px solid rgba(245,158,11,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            boxShadow: '0 0 32px rgba(245,158,11,0.25)',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            <Clock size={38} color="#f59e0b" />
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>
            Registration Submitted
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
            Your account for <strong style={{ color: 'var(--text-main)' }}>{submittedName}</strong> has been
            received and is <strong style={{ color: '#f59e0b' }}>awaiting admin approval</strong>.
            You will be able to log in once an administrator reviews and approves your registration.
          </p>

          {/* Status steps */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            marginBottom: '28px',
            textAlign: 'left',
          }}>
            {[
              { icon: CheckCircle2, label: 'Account created successfully', done: true, color: '#34d399' },
              { icon: Clock,        label: 'Pending admin review & approval', done: false, color: '#f59e0b' },
              { icon: ClipboardCheck, label: 'Access granted after approval', done: false, color: 'var(--text-subtle)' },
            ].map(({ icon: Icon, label, done, color }, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 0',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <Icon size={17} color={color} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: done ? color : color, fontWeight: done ? 600 : 400 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/login')}
            className="btn-secondary"
            style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 32px rgba(245,158,11,0.25); }
            50%       { box-shadow: 0 0 48px rgba(245,158,11,0.50); }
          }
        `}</style>
      </div>
    );
  }

  // ── Registration Form ───────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '36px 32px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: '0 0 20px var(--primary-glow)',
          }}>
            <ShieldCheck size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Create Protected Account</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Register credentials — an admin will review and approve your account
          </p>
        </div>

        {/* Admin approval notice */}
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '18px',
        }}>
          <Clock size={14} style={{ flexShrink: 0 }} />
          <span>New accounts require <strong>administrator approval</strong> before you can log in.</span>
        </div>

        {error && (
          <div style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '18px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>First Name</label>
              <input type="text" name="firstName" required className="glass-input" placeholder="Jane"
                value={formData.firstName} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Last Name</label>
              <input type="text" name="lastName" required className="glass-input" placeholder="Doe"
                value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
              <input type="email" name="email" required className="glass-input" placeholder="jane.doe@ecare.com"
                value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Username</label>
              <input type="text" name="username" required className="glass-input" placeholder="janedoe"
                value={formData.username} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Password (min 8 chars)</label>
            <input type="password" name="password" required minLength={8} className="glass-input"
              placeholder="••••••••••••" value={formData.password} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Contact Phone</label>
              <input type="tel" name="phoneNumber" className="glass-input" placeholder="+1-555-0199"
                value={formData.phoneNumber} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Assigned System Role</label>
              <select name="role" className="glass-input" value={formData.role} onChange={handleChange}
                style={{ cursor: 'pointer' }}>
                <option value="RESEARCHER" style={{ background: '#0f172a' }}>RESEARCHER (Clinical Trials)</option>
                <option value="INSURANCE"  style={{ background: '#0f172a' }}>INSURANCE (Claims Adjuster)</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary"
            style={{ marginTop: '8px', height: '46px' }}>
            {loading ? 'Submitting Registration...' : 'Submit Registration for Approval'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
