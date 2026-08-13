import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: '',
    price: '', country: '', location: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'url'
  /* default coords: centre of India */
  const [coords, setCoords] = useState({ lat: 20.5937, lng: 78.9629 });

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /**
   * When the user finishes typing in the Location field and blurs,
   * auto-geocode it to move the map to that place.
   */
  const handleLocationBlur = async () => {
    const q = `${form.location}${form.country ? ', ' + form.country : ''}`.trim();
    if (!q) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data[0]) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      }
    } catch { /* silent fail */ }
  };

  const submit = async e => {
    e.preventDefault();
    
    // Validate: either file OR URL required
    if (imageMode === 'upload' && !imageFile) {
      setToast({ message: 'Please upload an image', type: 'error' });
      return;
    }
    if (imageMode === 'url' && !imageUrl.trim()) {
      setToast({ message: 'Please enter an image URL', type: 'error' });
      return;
    }

    setLoading(true);
    const listing = {
      ...form,
      price: Number(form.price),
      geometry: { type: 'Point', coordinates: [coords.lng, coords.lat] },
    };

    try {
      if (imageMode === 'url') {
        // Direct URL — send as JSON
        listing.imageUrl = imageUrl.trim();
        const res = await api.post('/listings', { listing });
        navigate(`/listings/${res.data._id}`);
      } else {
        // File upload — send as FormData
        const fd = new FormData();
        fd.append('listing', JSON.stringify(listing));
        fd.append('image', imageFile);
        const res = await api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        navigate(`/listings/${res.data._id}`);
      }
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
              placeholder="e.g. Cosy mountain cabin" value={form.title} onChange={handle} required />
          </div>

          <div className="wl-field">
            <label className="wl-label">Description</label>
            <textarea name="description" className="wl-textarea"
              placeholder="Describe your place…" value={form.description} onChange={handle} required />
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
              <input
                name="location"
                type="text"
                className="wl-input"
                placeholder="e.g. Manali"
                value={form.location}
                onChange={handle}
                onBlur={handleLocationBlur}
                required
              />
            </div>
            <div className="wl-field">
              <label className="wl-label">Country</label>
              <input
                name="country"
                type="text"
                className="wl-input"
                placeholder="e.g. India"
                value={form.country}
                onChange={handle}
                onBlur={handleLocationBlur}
                required
              />
            </div>
          </div>

          <div className="wl-field">
            <label className="wl-label">Cover photo</label>
            
            {/* Toggle between upload / URL */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.875rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={imageMode === 'upload'}
                  onChange={() => setImageMode('upload')}
                />
                Upload from computer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '.875rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={imageMode === 'url'}
                  onChange={() => setImageMode('url')}
                />
                Paste image URL
              </label>
            </div>

            {imageMode === 'upload' ? (
              <>
                {imagePreview && (
                  <img src={imagePreview} alt="preview" className="wl-img-preview" />
                )}
                <input
                  type="file"
                  className="wl-input"
                  accept="image/*"
                  onChange={handleImage}
                />
              </>
            ) : (
              <>
                {imageUrl && (
                  <img src={imageUrl} alt="preview" className="wl-img-preview" onError={(e) => e.target.style.display = 'none'} />
                )}
                <input
                  type="url"
                  className="wl-input"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                  Paste a direct image link (JPG, PNG, WebP)
                </p>
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
              defaultLocation={
                form.location
                  ? `${form.location}${form.country ? ', ' + form.country : ''}`
                  : ''
              }
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
