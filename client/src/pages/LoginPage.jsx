import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ username: '', password: '' });
  const [toast, setToast] = useState({ message: '', type: 'error' });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/listings');
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Invalid credentials', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wl-form-page">
      <Toast message={toast.message} type={toast.type} onDone={() => setToast({ message: '' })} />
      <div className="wl-form-card">
        <h1 className="wl-form-title">Welcome back</h1>
        <p className="wl-form-subtitle">Log in to your StayNest account</p>

        <form onSubmit={submit}>
          <div className="wl-field">
            <label className="wl-label">Username</label>
            <input
              name="username"
              type="text"
              className="wl-input"
              placeholder="your_username"
              value={form.username}
              onChange={handle}
              required
              autoFocus
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
              required
            />
          </div>

          <button
            type="submit"
            className="wl-btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="wl-form-footer">
          <span>Don&apos;t have an account?</span>
          <Link to="/signup">Create one →</Link>
        </div>
      </div>
    </div>
  );
}
