import { useState } from 'react';
import api from '../api/axios';

/**
 * BookingModal
 * Props:
 *   listing   – full listing object
 *   onClose   – fn to close the modal
 *   onSuccess – fn({ booking, nights, totalPrice }) called on success
 */
export default function BookingModal({ listing, onClose, onSuccess }) {
  const today    = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    checkIn: today,
    checkOut: tomorrow,
    guests: 1,
    specialRequests: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Calculate preview
  const msPerDay = 1000 * 60 * 60 * 24;
  const nights   = Math.max(1, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / msPerDay));
  const subtotal = listing.price * nights;
  const gst      = Math.round(subtotal * 0.18);
  const total    = subtotal + gst;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.fullName.trim()) return setError('Full name is required');
    if (form.phone.replace(/\D/g, '').length < 10) return setError('Enter a valid phone number');
    if (new Date(form.checkOut) <= new Date(form.checkIn)) return setError('Check-out must be after check-in');

    setLoading(true);
    try {
      const res = await api.post('/bookings', {
        listingId: listing._id,
        ...form,
      });
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wl-modal-overlay" onClick={onClose}>
      <div className="wl-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Book this listing">

        {/* header */}
        <div className="wl-modal__header">
          <div>
            <h2 className="wl-modal__title">Reserve your stay</h2>
            <p className="wl-modal__sub">{listing.title}</p>
          </div>
          <button className="wl-modal__close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={submit} className="wl-modal__body">

          {/* Personal info */}
          <div className="wl-modal__section-title">Your details</div>

          <div className="wl-field">
            <label className="wl-label">Full Name <span style={{ color: 'var(--brand)' }}>*</span></label>
            <input
              name="fullName"
              type="text"
              className="wl-input"
              placeholder="As per ID proof"
              value={form.fullName}
              onChange={handle}
              required
              autoFocus
            />
          </div>

          <div className="wl-form-row">
            <div className="wl-field">
              <label className="wl-label">Phone <span style={{ color: 'var(--brand)' }}>*</span></label>
              <input
                name="phone"
                type="tel"
                className="wl-input"
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={handle}
                required
              />
            </div>
            <div className="wl-field">
              <label className="wl-label">Email (optional)</label>
              <input
                name="email"
                type="email"
                className="wl-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
              />
            </div>
          </div>

          {/* Stay details */}
          <div className="wl-modal__section-title" style={{ marginTop: '1rem' }}>Stay details</div>

          <div className="wl-form-row">
            <div className="wl-field">
              <label className="wl-label">Check-in <span style={{ color: 'var(--brand)' }}>*</span></label>
              <input
                name="checkIn"
                type="date"
                className="wl-input"
                value={form.checkIn}
                min={today}
                onChange={handle}
                required
              />
            </div>
            <div className="wl-field">
              <label className="wl-label">Check-out <span style={{ color: 'var(--brand)' }}>*</span></label>
              <input
                name="checkOut"
                type="date"
                className="wl-input"
                value={form.checkOut}
                min={form.checkIn}
                onChange={handle}
                required
              />
            </div>
          </div>

          <div className="wl-field">
            <label className="wl-label">Number of Guests</label>
            <select
              name="guests"
              className="wl-select"
              value={form.guests}
              onChange={handle}
            >
              {[1,2,3,4,5,6,7,8].map(n => (
                <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="wl-field">
            <label className="wl-label">Special Requests (optional)</label>
            <textarea
              name="specialRequests"
              className="wl-textarea"
              rows={2}
              placeholder="Early check-in, dietary needs, etc."
              value={form.specialRequests}
              onChange={handle}
            />
          </div>

          {/* Price summary */}
          <div className="wl-booking-summary">
            <div className="wl-booking-summary__row">
              <span>₹{listing.price.toLocaleString('en-IN')} × {nights} night{nights > 1 ? 's' : ''}</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="wl-booking-summary__row">
              <span>GST (18%)</span>
              <span>₹{gst.toLocaleString('en-IN')}</span>
            </div>
            <div className="wl-booking-summary__divider" />
            <div className="wl-booking-summary__row wl-booking-summary__total">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {error && <p className="wl-field-error">{error}</p>}

          <button
            type="submit"
            className="wl-btn-primary"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Confirming…' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
