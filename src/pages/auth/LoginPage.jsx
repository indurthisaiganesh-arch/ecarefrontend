import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('CREDENTIALS'); // 'CREDENTIALS' | 'OTP'
  const [otp, setOtp] = useState('');
  const [tempOtp, setTempOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { initiateLogin, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await initiateLogin(email, password);
      if (response.success && response.data) {
        // Admin bypassed 2FA — JWT already stored by AuthContext, go to dashboard
        if (response.data.requiresOtp === false) {
          navigate('/dashboard');
          return;
        }
        // Normal path — move to OTP step
        setTempOtp(response.data.tempOtp || '');
        setStep('OTP');
      } else {
        setError(response.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOtp(email, otp, 'LOGIN');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill test accounts without showing a role dropdown
  const fillTestAccount = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '36px 32px',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 24px var(--primary-glow)',
          }}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>
            {step === 'CREDENTIALS' ? 'Secure Healthcare Access' : 'Two-Factor Verification'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {step === 'CREDENTIALS'
              ? 'Zero-Trust Authenticated Patient Data Protection'
              : `Security code dispatched for ${email}`}
          </p>
        </div>

        {/* Error Alert */}
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
            marginBottom: '20px',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {step === 'CREDENTIALS' ? (
          /* Step 1: Email & Password */
          <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
                Workplace Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="email"
                  required
                  placeholder="name@ecare.com"
                  className="glass-input"
                  style={{ paddingLeft: '44px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="glass-input"
                  style={{ paddingLeft: '44px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '8px', width: '100%', height: '46px' }}
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
            }}>

              {/* Sign Up Navigation Button */}
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                  }}
                >
                  <span>Don't have an account? Register here</span>
                  <ArrowRight size={14} />
                </Link>
              </div>



            </div>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-main)' }}>
                Enter 6-Digit Verification Code
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="------"
                  className="glass-input"
                  style={{ paddingLeft: '44px', letterSpacing: '0.2em', fontSize: '18px', fontWeight: 700 }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="btn-primary"
              style={{ width: '100%', height: '46px' }}
            >
              {loading ? 'Verifying Cipher...' : 'Confirm Identity & Enter'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('CREDENTIALS'); setOtp(''); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '8px',
              }}
            >
              Back to Email & Password
            </button>
          </form>
        )}


      </div>
    </div>
  );
};
