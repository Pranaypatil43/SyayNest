import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const CATEGORIES = [
  { value: 'trending',   label: 'Trending' },
  { value: 'rooms',      label: 'Rooms' },
  { value: 'iconic',     label: 'Iconic Cities' },
  { value: 'mountains',  label: 'Mountains' },
  { value: 'beachfront', label: 'Beachfront' },
  { value: 'pools',      label: 'Amazing Pools' },
  { value: 'farms',      label: 'Farms' },
  { value: 'arctic',     label: 'Arctic' },
  { value: 'views',      label: 'Amazing Views' },
];

export default function EditListingPage() {
  const { id }         = useParams();
  const navigate       = useNavigate();
  const { currentUser } = useAuth();

  const [toast, setToast]       = useState({ message: '', type: 'success' });
  const [loading, setLoading]   = useState(false);
  const [fetchDone, setFetchDone] = useState(false);
  const [originalImage, setOriginalImage] = useState('');
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    price: '', country: '', location: '',
  });

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
    api.get(`/listings/${id}`)
      .then(res => {
        const l = res.data;
        setForm({
          title:       l.title || '',
          description: l.description || '',
          category:    l.category || '',
          price:       l.price || '',
          country:     l.country || '',
          location:    l.location || '',
        });
        if (l.image?.url) setOriginalImage(l.image.url.replace('/upload', '/upload/h_300,w_300'));
        setFetchDone(true);
      })
      .catch(() => navigate('/listings'));
  }, [id, currentUser, navigate]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    const listing = { ...form, price: Number(form.price) };
    const fd = new FormData();
    fd.append('listing', JSON.stringify(listing));
    if (imageFile) fd.append('image', imageFile);
    try {
      await api.put(`/listings/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/listings/${id}`);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to update', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!fetchDone) return <div className="wl-spinner"><div className="wl-spin" /></div>;

  return (
    <div className="wl-form-page" style={{ alignItems: 'flex-start' }}>
      <Toast message={toast.message} type={toast.type} onDone={() => setToast({ message: '' })} />
      <div className="wl-form-card wl-form-card--wide">
        <h1 className="wl-form-title">Edit listing</h1>
        <p className="wl-form-subtitle">Update your listing details</p>

        <form onSubmit={submit}>
          <div className="wl-field">
            <label className="wl-label">Title</label>
            <input name="title" type="text" className="wl-input"
              value={form.title} onChange={handle} required />
          </div>

          <div className="wl-field">
            <label className="wl-label">Description</label>
            <textarea name="description" className="wl-textarea"
              value={form.description} onChange={handle} required />
          </div>

          <div className="wl-form-row">
            <div className="wl-field">
              <label className="wl-label">Category</label>
              <select name="category" className="wl-select" value={form.category} onChange={handle} required>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="wl-field">
              <label className="wl-label">Price per night (₹)</label>
              <input name="price" type="number" min="0" className="wl-input"
                value={form.price} onChange={handle} required />
            </div>
          </div>

          <div className="wl-form-row">
            <div className="wl-field">
              <label className="wl-label">Location / City</label>
              <input name="location" type="text" className="wl-input"
                value={form.location} onChange={handle} required />
            </div>
            <div className="wl-field">
              <label className="wl-label">Country</label>
              <input name="country" type="text" className="wl-input"
                value={form.country} onChange={handle} required />
            </div>
          </div>

          <div className="wl-field">
            <label className="wl-label">Cover photo</label>
            {(imagePreview || originalImage) && (
              <img
                src={imagePreview || originalImage}
                alt="listing preview"
                className="wl-img-preview"
              />
            )}
            <input type="file" className="wl-input" accept="image/*" onChange={handleImage} />
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: 4 }}>
              Leave blank to keep the current image
            </p>
          </div>

          <button type="submit" className="wl-btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
