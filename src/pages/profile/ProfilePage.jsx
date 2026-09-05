import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import { RoleBadge, StatusBadge } from '../../components/StatusBadge';
import { User, Lock, Mail, Phone, ShieldCheck, Key, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user, role, refreshProfile } = useAuth();

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      const res = await userService.updateProfile(profileForm);
      if (res.data.success) {
        setProfileSuccess('Profile updated successfully');
        await refreshProfile();
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res.data.success) {
        setPasswordSuccess('Password successfully updated with BCrypt hashing');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Account & Security Preferences</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Manage your personal credentials and inspect cryptographic keys
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Profile Details */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary)" />
            Profile Demographics
          </h2>

          {profileSuccess && (
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#34d399', fontSize: '12px', marginBottom: '14px' }}>
              {profileSuccess}
            </div>
          )}
          {profileError && (
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', fontSize: '12px', marginBottom: '14px' }}>
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Email Address (Immutable)</label>
              <input type="text" disabled className="glass-input" value={user?.email || ''} style={{ opacity: 0.6 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>First Name</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Last Name</label>
                <input
                  type="text"
                  required
                  className="glass-input"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Contact Phone</label>
              <input
                type="tel"
                className="glass-input"
                placeholder="+1-555-0100"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
              />
            </div>

            <button type="submit" disabled={profileLoading} className="btn-primary" style={{ marginTop: '8px' }}>
              {profileLoading ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="#c084fc" />
            Update Password
          </h2>

          {passwordSuccess && (
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#34d399', fontSize: '12px', marginBottom: '14px' }}>
              {passwordSuccess}
            </div>
          )}
          {passwordError && (
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#f87171', fontSize: '12px', marginBottom: '14px' }}>
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Current Password</label>
              <input
                type="password"
                required
                className="glass-input"
                placeholder="••••••••••••"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>New Password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                className="glass-input"
                placeholder="••••••••••••"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Confirm New Password</label>
              <input
                type="password"
                required
                minLength={8}
                className="glass-input"
                placeholder="••••••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>

            <button type="submit" disabled={passwordLoading} className="btn-secondary" style={{ marginTop: '8px' }}>
              {passwordLoading ? 'Updating Hash...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Security & Cryptography Credentials Panel */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="var(--primary)" />
          Session Security Token & Credential Metrics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
          <div>
            <span style={{ color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>Authorization Level</span>
            <RoleBadge role={role} />
          </div>
          <div>
            <span style={{ color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>Password Storage</span>
            <span style={{ fontWeight: 600, color: '#34d399' }}>BCrypt work factor 12</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>Access Protocol</span>
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Stateless JWT (HMAC-SHA256)</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-subtle)', display: 'block', marginBottom: '4px' }}>Multi-Factor Auth</span>
            <span style={{ fontWeight: 600, color: '#c084fc' }}>Cryptographic 6-Digit OTP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
