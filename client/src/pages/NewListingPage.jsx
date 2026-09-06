import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Toast from '../components/Toast';
import LocationMap from '../components/LocationMap';

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

export default function NewListingPage() {
  const navigate = useNavigate();
  const [toast,   setToast]   = useState({ message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    price: '', country: '', location: '',
  });

  // Multiple file uploads
  const [imageFiles,    setImageFiles]    = useState([]);   // File objects
  const [imagePreviews, setImagePreviews] = useState([]);   // blob URLs

  // Multiple URL inputs
  const [imageUrls, setImageUrls] = useState(['']);         // array of strings

  const [imageMode, setImageMode] = useState('upload');     // 'upload' | 'url'
  const [coords,    setCoords]    = useState({ lat: 20.5937, lng: 78.9629 });

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ── Image file handlers ──────────────────────────────────
  const handleImages = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageFiles(files);
    setImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeFile = (idx) => {
    setImageFiles(p  => p.filter((_, i) => i !== idx));
    setImagePreviews(p => p.filter((_, i) => i !== idx));
  };

  // ── URL handlers ─────────────────────────────────────────
  const handleUrlChange = (idx, val) => {
    setImageUrls(p => p.map((u, i) => i === idx ? val : u));
  };
  const addUrlField   = () => setImageUrls(p => [...p, '']);
  const removeUrl     = idx => setImageUrls(p => p.filter((_, i) => i !== idx));

  // ── Location blur → geocode ──────────────────────────────
  const handleLocationBlur = async () => {
    const q = `${form.location}${form.country ? ', ' + form.country : ''}`.trim();
    if (!q) return;
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data[0]) setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
    } catch { /* silent */ }
  };

  // ── Submit ───────────────────────────────────────────────
  const submit = async e => {
    e.preventDefault();

    const validUrls = imageUrls.map(u => u.trim()).filter(Boolean);

    if (imageMode === 'upload' && !imageFiles.length) {
      return setToast({ message: 'Please upload at least one image', type: 'error' });
    }
    if (imageMode === 'url' && !validUrls.length) {
      return setToast({ message: 'Please enter at least one image URL', type: 'error' });
    }

    setLoading(true);
    const listing = {
      ...form,
      price:    Number(form.price),
      geometry: { type: 'Point', coordinates: [coords.lng, coords.lat] },
    };

    try {
      const fd = new FormData();

      if (imageMode === 'url') {
        listing.imageUrls = validUrls;
        fd.append('listing', JSON.stringify(listing));
      } else {
        fd.append('listing', JSON.stringify(listing));
        imageFiles.forEach(f => fd.append('images', f));
      }

      const res = await api.post('/listings', fd);
      navigate(`/listings/${res.data._id}`);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Failed to create listing', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wl-form-page" style={{ alignItems: 'flex-start' }}>
      <Toast message={toast.message} type={toast.type} onDone={() => setToast({ message: '' })} />
      <div className="wl-form-card wl-form-card--wide">
        <h1 className="wl-form-title">Add a new listing</h1>
        <p className="wl-form-subtitle">Fill in the details to publish your place</p>

        <form onSubmit={submit}>

          <div className="wl-field">
            <label className="wl-label">Title</label>
            <input name="title" type="text" className="wl-input"
              placeholder="e.g. Cosy mountain cabin"
              value={form.title} onChange={handle} required />
          </div>

          <div className="wl-field">
            <label className="wl-label">Description</label>
            <textarea name="description" className="wl-textarea"
              placeholder="Describe your place…"
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
                placeholder="e.g. 2500" value={form.price} onChange={handle} required />
            </div>
          </div>

          <div className="wl-form-row">
            <div className="wl-field">
              <label className="wl-label">Location / City</label>
              <input name="location" type="text" className="wl-input"
                placeholder="e.g. Manali"
                value={form.location} onChange={handle} onBlur={handleLocationBlur} required />
            </div>
            <div className="wl-field">
              <label className="wl-label">Country</label>
              <input name="country" type="text" className="wl-input"
                placeholder="e.g. India"
                value={form.country} onChange={handle} onBlur={handleLocationBlur} required />
            </div>
          </div>

          {/* ── Photos ── */}
          <div className="wl-field">
            <label className="wl-label">
              Photos <span style={{ color: 'var(--ink-soft)', textTransform: 'none', fontWeight: 400 }}>(up to 10)</span>
            </label>

            {/* mode toggle */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              {['upload', 'url'].map(m => (
                <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.875rem', cursor: 'pointer' }}>
                  <input type="radio" checked={imageMode === m} onChange={() => setImageMode(m)} />
                  {m === 'upload' ? 'Upload from computer' : 'Paste image URLs'}
                </label>
              ))}
            </div>

            {imageMode === 'upload' ? (
              <>
                {/* previews grid */}
                {imagePreviews.length > 0 && (
                  <div className="wl-img-grid">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="wl-img-grid__item">
                        <img src={src} alt={`preview ${i + 1}`} />
                        <button type="button" className="wl-img-grid__remove" onClick={() => removeFile(i)} aria-label="Remove">
                          <i className="fa-solid fa-xmark" />
                        </button>
                        {i === 0 && <span className="wl-img-grid__label">Cover</span>}
                      </div>
                    ))}
                  </div>
                )}
                <label className="wl-upload-btn">
                  <i className="fa-solid fa-cloud-arrow-up" />
                  {imagePreviews.length ? 'Change photos' : 'Choose photos'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImages}
                  />
                </label>
                <p style={{ fontSize: '.75rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                  Select multiple at once. First photo = cover image.
                </p>
              </>
            ) : (
              <>
                {imageUrls.map((url, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        type="url"
                        className="wl-input"
                        placeholder={`Image URL ${i + 1}`}
                        value={url}
                        onChange={e => handleUrlChange(i, e.target.value)}
                      />
                    </div>
                    {url && (
                      <img
                        src={url}
                        alt=""
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    )}
                    {imageUrls.length > 1 && (
                      <button type="button" onClick={() => removeUrl(i)}
                        style={{ background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer', fontSize: '1rem', padding: '4px', flexShrink: 0 }}>
                        <i className="fa-solid fa-xmark" />
                      </button>
                    )}
                  </div>
                ))}
                {imageUrls.length < 10 && (
                  <button type="button" className="wl-add-url-btn" onClick={addUrlField}>
                    <i className="fa-solid fa-plus" /> Add another URL
                  </button>
                )}
              </>
            )}
          </div>

          {/* ── map picker ── */}
          <div className="wl-field">
            <label className="wl-label">Pin location on map</label>
            <LocationMap
              mode="picker"
              coords={coords}
              onCoordsChange={setCoords}
              defaultLocation={form.location ? `${form.location}${form.country ? ', ' + form.country : ''}` : ''}
            />
          </div>

          <button type="submit" className="wl-btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Publishing…' : 'Publish listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
