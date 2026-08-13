import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import LocationMap from '../components/LocationMap';

function Stars({ rating, max = 5 }) {
  return (
    <span className="wl-stars">
      {'★'.repeat(rating)}{'☆'.repeat(max - rating)}
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="wl-star-pick">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={n <= (hovered || value) ? 'lit' : ''}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ShowPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [listing, setListing]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState({ message: '', type: 'success' });
  const [rating, setRating]     = useState(5);
  const [comment, setComment]   = useState('');
  const [submitting, setSub]    = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(r => setListing(r.data))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      navigate('/listings');
    } catch {
      showToast('Failed to delete listing', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSub(true);
    try {
      const res = await api.post(`/listings/${id}/reviews`, {
        review: { rating, comment },
      });
      const enriched = { ...res.data, author: { _id: currentUser._id, username: currentUser.username } };
      setListing(prev => ({ ...prev, reviews: [...prev.reviews, enriched] }));
      setComment(''); setRating(5);
      showToast('Review added!');
    } catch {
      showToast('Failed to add review', 'error');
    } finally {
      setSub(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/listings/${id}/reviews/${reviewId}`);
      setListing(prev => ({ ...prev, reviews: prev.reviews.filter(r => r._id !== reviewId) }));
      showToast('Review deleted');
    } catch {
      showToast('Failed to delete review', 'error');
    }
  };

  if (loading) return <div className="wl-spinner"><div className="wl-spin" /></div>;
  if (!listing) return null;

  const isOwner = currentUser && listing.owner?._id === currentUser._id;

  return (
    <div className="wl-show">
      <Toast message={toast.message} type={toast.type} onDone={() => setToast({ message: '' })} />

      {/* title */}
      <h1 className="wl-show__title">{listing.title}</h1>
      <div className="wl-show__meta">
        <span>
          <i className="fa-solid fa-location-dot" style={{ marginRight: 4 }} />
          {listing.location}, {listing.country}
        </span>
        <span className="wl-show__meta-dot">
          {listing.category && <span style={{ textTransform: 'capitalize' }}>{listing.category}</span>}
        </span>
        {listing.reviews.length > 0 && (
          <span className="wl-show__meta-dot">
            <Stars rating={Math.round(listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length)} />
            &nbsp;({listing.reviews.length})
          </span>
        )}
      </div>

      {/* hero image */}
      <img
        className="wl-show__hero"
        src={listing.image?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=60'}
        alt={listing.title}
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=60'; }}
      />

      {/* two-col layout */}
      <div className="wl-show__grid">
        {/* left */}
        <div>
          {isOwner && (
            <div className="wl-owner-actions">
              <Link to={`/listings/${listing._id}/edit`} className="wl-btn-outline">
                <i className="fa-solid fa-pen-to-square" /> Edit
              </Link>
              <button className="wl-btn-danger" onClick={handleDelete}>
                <i className="fa-solid fa-trash" /> Delete
              </button>
            </div>
          )}

          <p className="wl-show__desc">{listing.description}</p>
          <hr className="wl-show__divider" />

          {/* map */}
          <h3 style={{ fontFamily: 'Fraunces,serif', marginBottom: 4 }}>Where you&apos;ll be</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', marginBottom: 6 }}>
            {listing.location}, {listing.country}
          </p>
          {listing.geometry?.coordinates && (
            <LocationMap
              mode="view"
              coords={{
                lat: listing.geometry.coordinates[1],
                lng: listing.geometry.coordinates[0],
              }}
              label={`${listing.title} · ${listing.location}, ${listing.country}`}
            />
          )}

          <hr className="wl-show__divider" />

          {/* reviews */}
          <div className="wl-reviews">
            <h3 className="wl-reviews__title">
              {listing.reviews.length > 0
                ? `${listing.reviews.length} Review${listing.reviews.length > 1 ? 's' : ''}`
                : 'No reviews yet'}
            </h3>

            {listing.reviews.map(review => (
              <div key={review._id} className="wl-review-card">
                <div className="wl-review-card__head">
                  <div>
                    <span className="wl-review-card__author">@{review.author?.username}</span>
                    &nbsp;&nbsp;
                    <Stars rating={review.rating} />
                  </div>
                  {currentUser && review.author?._id === currentUser._id && (
                    <button
                      className="wl-btn-danger"
                      style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  )}
                </div>
                <p className="wl-review-card__comment">{review.comment}</p>
              </div>
            ))}

            {/* review form */}
            {currentUser ? (
              <div className="wl-review-form">
                <h4>Leave a review</h4>
                <form onSubmit={handleReviewSubmit}>
                  <div className="wl-field">
                    <label className="wl-label">Your rating</label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>
                  <div className="wl-field">
                    <label className="wl-label">Comment</label>
                    <textarea
                      className="wl-textarea"
                      rows={4}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your experience…"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="wl-btn-primary"
                    disabled={submitting}
                    style={{ width: 'auto', padding: '11px 28px', display: 'inline-block' }}
                  >
                    {submitting ? 'Submitting…' : 'Submit review'}
                  </button>
                </form>
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-soft)' }}>
                <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>Log in</Link> to leave a review.
              </p>
            )}
          </div>
        </div>

        {/* right — booking box */}
        <div>
          <div className="wl-book-box">
            <div className="wl-book-box__price">
              &#8377;{Number(listing.price).toLocaleString('en-IN')}
              <span> / night</span>
            </div>
            <div className="wl-book-box__owner">
              Hosted by <b>{listing.owner?.username}</b>
            </div>

            {listing.reviews.length > 0 && (
              <>
                <div className="wl-book-box__row">
                  <span>Avg. rating</span>
                  <span>
                    <Stars rating={Math.round(listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length)} />
                  </span>
                </div>
                <div className="wl-book-box__row">
                  <span>Reviews</span>
                  <span>{listing.reviews.length}</span>
                </div>
                <hr className="wl-book-box__divider" />
              </>
            )}

            <div className="wl-book-box__row">
              <span>Per night</span>
              <span>&#8377;{Number(listing.price).toLocaleString('en-IN')}</span>
            </div>
            <div className="wl-book-box__row">
              <span>GST (18%)</span>
              <span>&#8377;{Math.round(listing.price * 0.18).toLocaleString('en-IN')}</span>
            </div>
            <hr className="wl-book-box__divider" />
            <div className="wl-book-box__row" style={{ fontWeight: 600 }}>
              <span>Total</span>
              <span>&#8377;{Math.round(listing.price * 1.18).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              {currentUser ? (
                <button className="wl-btn-primary">Reserve</button>
              ) : (
                <Link to="/login" className="wl-btn-primary">Log in to reserve</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
