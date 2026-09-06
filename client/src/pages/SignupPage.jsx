import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── OTP verify step (customer auto-signup) ─────────────── */
function OtpStep({ email, fullName, onBack, onSuccess }) {
  const { verifyOtp, sendOtp } = useAuth();
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [resent,  setResent]  = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit OTP');
    setLoading(true); setError('');
    try {
      const user = await verifyOtp(email, otp, fullName);
      onSuccess(user);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Try again.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try { await sendOtp(email); setResent(true); setTimeout(() => setResent(false), 4000); }
    catch { setError('Failed to resend OTP.'); }
  };

  return (
    <form onSubmit={handleVerify} className="wl-auth-form">
      <div className="wl-auth-email-chip">
        <i className="fa-solid fa-envelope" />
        <span>{email}</span>
        <button type="button" onClick={onBack} className="wl-auth-chip-change">Change</button>
      </div>
      <p className="wl-auth-otp-hint">We sent a 6-digit code to your email. Enter it to activate your account.</p>

      <div className="wl-field">
        <label className="wl-label">One-time password</label>
        <input type="text" inputMode="numeric" className="wl-input wl-otp-input"
          placeholder="· · · · · ·"
          value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
          maxLength={6} required autoFocus />
      </div>

      {error && <p className="wl-field-error"><i className="fa-solid fa-circle-exclamation" /> {error}</p>}

      <button type="submit" className="wl-btn-primary" disabled={loading}>
        {loading
          ? <><i className="fa-solid fa-circle-notch fa-spin" /> Verifying…</>
          : <><i className="fa-solid fa-check" /> Verify &amp; Create account</>}
      </button>

      <div className="wl-auth-resend">
        Didn't receive it?&nbsp;
        {resent
          ? <span style={{ color:'#22c55e', fontWeight:600 }}>Sent!</span>
          : <button type="button" className="wl-auth-link" onClick={handleResend}>Resend OTP</button>
        }
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════
   SIGNUP PAGE
══════════════════════════════════════════ */
export default function SignupPage() {
  const { signup, sendOtp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const defaultRole = params.get('role') === 'host' ? 'host' : 'guest';
  const [role, setRole] = useState(defaultRole);

  // Customer state
  const [guestForm, setGuestForm] = useState({ fullName: '', email: '' });
  const [guestStep, setGuestStep] = useState(1); // 1=form, 2=otp

  // Host state
  const [hostForm,  setHostForm]  = useState({ username: '', email: '' });
  const [hostDone,  setHostDone]  = useState(false);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  /* ── Customer signup: send OTP ── */
  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestForm.fullName.trim()) return setError('Enter your full name');
    if (!guestForm.email.trim())    return setError('Enter your email address');
    setLoading(true); setError('');
    try {
      await sendOtp(guestForm.email.trim().toLowerCase());
      setGuestStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  /* ── Host signup: create account ── */
  const handleHostSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await signup(hostForm.username.trim(), hostForm.email.trim().toLowerCase());
      setHostDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally { setLoading(false); }
  };

  const switchRole = (r) => { setRole(r); setError(''); setGuestStep(1); };

  /* ── Host success screen ── */
  if (hostDone) return (
    <div className="wl-auth-page">
      <div className="wl-auth-card" style={{ textAlign: 'center' }}>
        <div className="wl-auth-success-icon"><i className="fa-solid fa-circle-check" /></div>
        <h1 className="wl-auth-title">Host account created!</h1>
        <p className="wl-auth-sub" style={{ marginBottom: '1.75rem' }}>
          Welcome aboard! Log in with your email OTP to start listing your properties on StayNest.
        </p>
        <button className="wl-btn-primary" onClick={() => navigate('/login?role=host')}>
          <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 8 }} />
          Log in as Host
        </button>
      </div>
    </div>
  );

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

        <h1 className="wl-auth-title">Create an account</h1>
        <p className="wl-auth-sub">Join StayNest — it's free</p>

        {/* Role tabs */}
        <div className="wl-auth-tabs">
          <button type="button"
            className={`wl-auth-tab ${role === 'guest' ? 'active' : ''}`}
            onClick={() => switchRole('guest')}>
            <i className="fa-solid fa-user" /> Customer
          </button>
          <button type="button"
            className={`wl-auth-tab ${role === 'host' ? 'active' : ''}`}
            onClick={() => switchRole('host')}>
            <i className="fa-solid fa-house" /> Host
          </button>
        </div>

        {/* ── CUSTOMER ── */}
        {role === 'guest' && guestStep === 1 && (
          <form onSubmit={handleGuestSubmit} className="wl-auth-form">
            <div className="wl-auth-role-info">
              <i className="fa-solid fa-circle-info" />
              <span>Book stays, leave reviews, and manage your trips.</span>
            </div>

            <div className="wl-field">
              <label className="wl-label">Full name</label>
              <div className="wl-input-icon-wrap">
                <i className="fa-solid fa-user wl-input-icon" />
                <input type="text" className="wl-input wl-input--icon"
                  placeholder="e.g. Rahul Sharma"
                  value={guestForm.fullName}
                  onChange={e => { setGuestForm(p => ({...p, fullName: e.target.value})); setError(''); }}
                  required autoFocus />
              </div>
            </div>

            <div className="wl-field">
              <label className="wl-label">Email address</label>
              <div className="wl-input-icon-wrap">
                <i className="fa-solid fa-envelope wl-input-icon" />
                <input type="email" className="wl-input wl-input--icon"
                  placeholder="you@example.com"
                  value={guestForm.email}
                  onChange={e => { setGuestForm(p => ({...p, email: e.target.value})); setError(''); }}
                  required />
              </div>
            </div>

            {error && <p className="wl-field-error"><i className="fa-solid fa-circle-exclamation" /> {error}</p>}

            <button type="submit" className="wl-btn-primary" disabled={loading}>
              {loading
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> Sending OTP…</>
                : <><i className="fa-solid fa-paper-plane" /> Continue — Get OTP</>}
            </button>

            <p className="wl-auth-terms">
              By continuing, you agree to StayNest's <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>
        )}

        {role === 'guest' && guestStep === 2 && (
          <OtpStep
            email={guestForm.email}
            fullName={guestForm.fullName}
            onBack={() => { setGuestStep(1); setError(''); }}
            onSuccess={() => navigate('/listings')}
          />
        )}

        {/* ── HOST ── */}
        {role === 'host' && (
          <form onSubmit={handleHostSubmit} className="wl-auth-form">
            <div className="wl-auth-role-info wl-auth-role-info--host">
              <i className="fa-solid fa-circle-info" />
              <span>List your property, manage bookings, and earn from your space.</span>
            </div>

            <div className="wl-field">
              <label className="wl-label">Display name</label>
              <div className="wl-input-icon-wrap">
                <i className="fa-solid fa-id-badge wl-input-icon" />
                <input type="text" className="wl-input wl-input--icon"
                  placeholder="e.g. raj_stays or Rajesh Kumar"
                  value={hostForm.username}
                  onChange={e => { setHostForm(p => ({...p, username: e.target.value})); setError(''); }}
                  required autoFocus />
              </div>
            </div>

            <div className="wl-field">
              <label className="wl-label">Email address</label>
              <div className="wl-input-icon-wrap">
                <i className="fa-solid fa-envelope wl-input-icon" />
                <input type="email" className="wl-input wl-input--icon"
                  placeholder="host@example.com"
                  value={hostForm.email}
                  onChange={e => { setHostForm(p => ({...p, email: e.target.value})); setError(''); }}
                  required />
              </div>
              <p style={{ fontSize:'.75rem', color:'var(--ink-soft)', marginTop:4 }}>
                You'll use this email to log in — we'll send an OTP each time.
              </p>
            </div>

            {error && <p className="wl-field-error"><i className="fa-solid fa-circle-exclamation" /> {error}</p>}

            <button type="submit" className="wl-btn-primary" disabled={loading}>
              {loading
                ? <><i className="fa-solid fa-circle-notch fa-spin" /> Creating…</>
                : <><i className="fa-solid fa-house-chimney" /> Create host account</>}
            </button>

            <p className="wl-auth-terms">
              By signing up, you agree to StayNest's <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>
        )}

        {/* Bottom switch */}
        <div className="wl-auth-switch">
          Already have an account?&nbsp;
          <Link to={`/login?role=${role}`} className="wl-auth-link">Log in →</Link>
        </div>

      </div>
    </div>
  );
}
