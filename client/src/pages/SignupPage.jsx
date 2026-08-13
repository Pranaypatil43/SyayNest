import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ username: '', email: '', password: '' });
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      navigate('/listings');
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Signup failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wl-form-page">
      <Toast message={toast.message} type={toast.type} onDone={() => setToast({ message: '' })} />
      <div className="wl-form-card">
        <h1 className="wl-form-title">Join StayNest</h1>
        <p className="wl-form-subtitle">Create your free account in seconds</p>

        <form onSubmit={submit}>
          <div className="wl-field">
            <label className="wl-label">Username</label>
            <input
              name="username"
              type="text"
              className="wl-input"
              placeholder="choose a username"
              value={form.username}
              onChange={handle}
              required
              autoFocus
            />
          </div>

          <div className="wl-field">
            <label className="wl-label">Email</label>
            <input
              name="email"
              type="email"
              className="wl-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handle}
            />
          </div>

          <div className="wl-field">
            <label className="wl-label">Password</label>
            <input
              name="password"
              type="password"
              className="wl-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handle}
            />
          </div>

          <button
            type="submit"
            className="wl-btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="wl-form-footer">
          <span>Already have an account?</span>
          <Link to="/login">Log in →</Link>
        </div>
      </div>
    </div>
  );
}
