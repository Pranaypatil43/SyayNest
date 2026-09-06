import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
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
  const { id }   = useParams();
  const navigate = useNavigate();

  const [toast,     setToast]     = useState({ message: '', type: 'success' });
  const [loading,   setLoading]   = useState(false);
  const [fetchDone, setFetchDone] = useState(false);

  // Existing images from DB
  const [existingImgs, setExistingImgs] = useState([]); // [{ url, filename }]

  // New files to add
  const [newFiles,    setNewFiles]    = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  // Replace vs append
  const [replaceImages, setReplaceImages] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: '',
    price: '', country: '', location: '',
  });

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => {
        const l = res.data;
        setForm({
          title:       l.title       || '',
          description: l.description || '',
          category:    l.category    || '',
          price:       l.price       || '',
          country:     l.country     || '',
          location:    l.location    || '',
        });
        // Support both new images[] and legacy image
        const imgs = l.images?.length
          ? l.images
          : l.image?.url ? [l.image] : [];
        setExistingImgs(imgs);
        setFetchDone(true);
      })
      .catch(() => navigate('/listings'));
  }, [id, navigate]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleNewFiles = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setNewFiles(files);
    setNewPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    const listing = { ...form, price: Number(form.price), replaceImages };
    const fd = new FormData();
    fd.append('listing', JSON.stringify(listing));
    newFiles.forEach(f => fd.append('images', f));
    try {
      await api.put(`/listings/${id}`, fd);
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
            <input name="title" type="text" className="wl-input" value={form.title} onChange={handle} required />
          </div>

          <div className="wl-field">
            <label className="wl-label">Description</label>
            <textarea name="description" className="wl-textarea" value={form.description} onChange={handle} required />
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
              <input name="price" type="number" min="0" className="wl-input" value={form.price} onChange={handle} required />
            </div>
          </div>

          <div className="wl-form-row">
            <div className="wl-field">
              <label className="wl-label">Location / City</label>
              <input name="location" type="text" className="wl-input" value={form.location} onChange={handle} required />
            </div>
            <div className="wl-field">
              <label className="wl-label">Country</label>
              <input name="country" type="text" className="wl-input" value={form.country} onChange={handle} required />
            </div>
          </div>

          {/* ── Current photos ── */}
          <div className="wl-field">
            <label className="wl-label">Current photos</label>
            {existingImgs.length > 0 ? (
              <div className="wl-img-grid">
                {existingImgs.map((img, i) => (
                  <div key={i} className="wl-img-grid__item">
                    <img src={img.url} alt={`photo ${i + 1}`} />
                    {i === 0 && <span className="wl-img-grid__label">Cover</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '.83rem', color: 'var(--ink-soft)' }}>No photos yet</p>
            )}
          </div>

          {/* ── New photos ── */}
          <div className="wl-field">
            <label className="wl-label">Add / replace photos</label>

            {newPreviews.length > 0 && (
              <div className="wl-img-grid" style={{ marginBottom: '0.75rem' }}>
                {newPreviews.map((src, i) => (
                  <div key={i} className="wl-img-grid__item">
                    <img src={src} alt={`new ${i + 1}`} />
                    {i === 0 && <span className="wl-img-grid__label">New cover</span>}
                  </div>
                ))}
              </div>
            )}

            <label className="wl-upload-btn">
              <i className="fa-solid fa-cloud-arrow-up" />
              {newPreviews.length ? 'Change selection' : 'Upload new photos'}
              <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleNewFiles} />
            </label>

            {newFiles.length > 0 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: '.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={replaceImages}
                  onChange={e => setReplaceImages(e.target.checked)}
                />
                Replace all existing photos with new ones
              </label>
            )}
            <p style={{ fontSize: '.75rem', color: 'var(--ink-soft)', marginTop: 4 }}>
              Leave blank to keep current photos. First new photo becomes the cover.
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
