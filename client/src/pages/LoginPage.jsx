import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── shared OTP step ─────────────────────────────────────── */
function OtpStep({ email, role, onBack, onSuccess }) {
  const { verifyOtp, sendOtp } = useAuth();
  const [otp,      setOtp]     = useState('');
  const [fullName, setFullName] = useState('');
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState('');
  const [resent,   setResent]  = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit OTP sent to your email');
    setLoading(true); setError('');
    try {
      const user = await verifyOtp(email, otp, fullName);
      onSuccess(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try {
      await sendOtp(email);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch { setError('Failed to resend. Please try again.'); }
  };

  return (
    <form onSubmit={handleVerify} className="wl-auth-form">
      {/* email chip */}
      <div className="wl-auth-email-chip">
        <i className="fa-solid fa-envelope" />
        <span>{email}</span>
        <button type="button" onClick={onBack} className="wl-auth-chip-change">Change</button>
      </div>

      <p className="wl-auth-otp-hint">
        We sent a 6-digit code to your email. Enter it below to log in.
      </p>

      {/* name — only for guests who might be new */}
      {role === 'guest' && (
        <div className="wl-field">
          <label className="wl-label">Your full name <span className="wl-label-opt">(new accounts only)</span></label>
          <input type="text" className="wl-input" placeholder="e.g. Rahul Sharma"
            value={fullName} onChange={e => setFullName(e.target.value)} autoFocus />
        </div>
      )}

      <div className="wl-field" style={{ marginTop: role === 'guest' ? 0 : 0 }}>
        <label className="wl-label">One-time password</label>
        <input
          type="text" inputMode="numeric" className="wl-input wl-otp-input"
          placeholder="· · · · · ·"
          value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
          maxLength={6} required autoFocus={role !== 'guest'}
        />
      </div>

      {error && <p className="wl-field-error"><i className="fa-solid fa-circle-exclamation" /> {error}</p>}

      <button type="submit" className="wl-btn-primary" disabled={loading}>
        {loading
          ? <><i className="fa-solid fa-circle-notch fa-spin" /> Verifying…</>
          : <><i className="fa-solid fa-check" /> Verify &amp; Log in</>}
      </button>

      <div className="wl-auth-resend">
        Didn't receive the code?&nbsp;
        {resent
          ? <span style={{ color: '#22c55e', fontWeight: 600 }}>Sent!</span>
          : <button type="button" className="wl-auth-link" onClick={handleResend}>Resend OTP</button>
        }
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════
   LOGIN PAGE
══════════════════════════════════════════ */
export default function LoginPage() {
  const { sendOtp } = useAuth();
  const navigate    = useNavigate();
  const [params]    = useSearchParams();

  const defaultRole = params.get('role') === 'host' ? 'host' : 'guest';
  const [role,    setRole]    = useState(defaultRole);
  const [email,   setEmail]   = useState('');
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Enter your email address');
    setLoading(true); setError('');
    try {
      await sendOtp(email.trim().toLowerCase());
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Check your email.');
    } finally { setLoading(false); }
  };

  const handleSuccess = () => navigate('/listings');

  return (
    <div className="wl-auth-page">
      <div className="wl-auth-card">

        {/* Logo */}
        <div className="wl-auth-logo">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <path d="M16 2C10 10 6 14.5 6 18.5a10 10 0 0 0 20 0C26 14.5 22 10 16 2z" fill="#ff385c"/>
          </svg>
          <span>StayNest</span>
        </div>

        <h1 className="wl-auth-title">Welcome back</h1>
        <p className="wl-auth-sub">Log in to your StayNest account</p>

        {/* Role tabs */}
        <div className="wl-auth-tabs">
          <button
            type="button"
            className={`wl-auth-tab ${role === 'guest' ? 'active' : ''}`}
            onClick={() => { setRole('guest'); setStep(1); setEmail(''); setError(''); }}
          >
            <i className="fa-solid fa-user" />
            Customer
          </button>
          <button
            type="button"
            className={`wl-auth-tab ${role === 'host' ? 'active' : ''}`}
            onClick={() => { setRole('host'); setStep(1); setEmail(''); setError(''); }}
          >
            <i className="fa-solid fa-house" />
            Host
          </button>
        </div>

        {/* Step 1 — Email */}
        {step === 1 && (
          <form onSubmit={handleSend} className="wl-auth-form">
            <div className="wl-field">
              <label className="wl-label">Email address</label>
              <div className="wl-input-icon-wrap">
                <i className="fa-solid fa-envelope wl-input-icon" />
                <input
                  type="email" className="wl-input wl-input--icon"
                  placeholder={role === 'host' ? 'host@example.com' : 'you@example.com'}
                  value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  required autoFocus
                />
              </div>
            </div>

            {error && <p className="wl-field-error"><i className="fa-solid fa-circle-exclamation" /> {error}</p>}

            <button type="submit" className="wl-btn-primary" disabled={loading}>
              {loading
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> Sending OTP…</>
                : <><i className="fa-solid fa-paper-plane" /> Send OTP to email</>}
            </button>

            <p className="wl-auth-footer-note">
              {role === 'guest'
                ? <>New here? Just enter your email — we'll create your account automatically.</>
                : <>New host? <Link to="/signup?role=host" className="wl-auth-link">Create a host account →</Link></>
              }
            </p>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === 2 && (
          <OtpStep
            email={email}
            role={role}
            onBack={() => { setStep(1); setError(''); }}
            onSuccess={handleSuccess}
          />
        )}

        {/* Switch role note */}
        <div className="wl-auth-switch">
          {role === 'guest'
            ? <>Want to list your property? <Link to="/signup?role=host" className="wl-auth-link">Become a host</Link></>
            : <>Looking to book a stay? <button type="button" className="wl-auth-link" onClick={() => { setRole('guest'); setStep(1); setEmail(''); }}>Log in as customer</button></>
          }
        </div>

      </div>
    </div>
  );
}
