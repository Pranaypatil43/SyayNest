import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import LocationMap from '../components/LocationMap';
import BookingModal from '../components/BookingModal';

const FALLBACK = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=60';

/** Show fullName if available, otherwise clean up the auto-generated username */
function displayName(user) {
  if (!user) return 'Guest';
  if (user.fullName?.trim()) return user.fullName.trim();
  const u = user.username || '';
  return u.replace(/^guest_/, '').replace(/_[a-z0-9]{6,}$/i, '').replace(/_/g, ' ').trim() || 'Guest';
}

/* ── photo grid ── */
function PhotoGrid({ imgs }) {
  const [lightbox, setLightbox] = useState(null);

  // Safety: filter out any falsy values
  const validImgs = (imgs || []).filter(Boolean);

  if (!validImgs.length) return (
    <div className="wl-show__hero-wrap">
      <img className="wl-show__hero-single" src={FALLBACK} alt="listing" />
    </div>
  );

  if (validImgs.length === 1) return (
    <div className="wl-show__hero-wrap">
      <img className="wl-show__hero-single" src={validImgs[0]} alt="listing"
        onError={e => { e.target.src = FALLBACK; }} onClick={() => setLightbox(0)} />
      {lightbox !== null && (
        <Lightbox imgs={validImgs} start={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );

  const shown = validImgs.slice(0, 5);
  const count = shown.length; // 2, 3, 4, or 5 → drives CSS class

  return (
    <div className="wl-show__hero-wrap">
      <div className={`wl-pgrid wl-pgrid--${count}`}>
        {shown.map((url, i) => (
          <div key={i} className="wl-pgrid__cell" onClick={() => setLightbox(i)}>
            <img src={url} alt={`photo ${i+1}`} onError={e => { e.target.src = FALLBACK; }} />
          </div>
        ))}
        {validImgs.length > 5 && (
          <button className="wl-pgrid__showall" onClick={() => setLightbox(0)}>
            <i className="fa-solid fa-images" /> Show all {validImgs.length} photos
          </button>
        )}
      </div>
      {lightbox !== null && (
        <Lightbox imgs={validImgs} start={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}

/* ── lightbox ── */
function Lightbox({ imgs, start, onClose }) {
  const [idx, setIdx] = useState(start);
  return (
    <div className="wl-lightbox" onClick={onClose}>
      <button className="wl-lightbox__close" onClick={onClose} aria-label="Close">
        <i className="fa-solid fa-xmark" />
      </button>
      <button className="wl-lightbox__arrow wl-lightbox__arrow--prev"
        onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); }}
        aria-label="Previous">
        <i className="fa-solid fa-chevron-left" />
      </button>
      <div className="wl-lightbox__img-wrap" onClick={e => e.stopPropagation()}>
        <img src={imgs[idx]} alt={`photo ${idx+1}`} onError={e => { e.target.src = FALLBACK; }} />
        <div className="wl-lightbox__counter">{idx+1} / {imgs.length}</div>
      </div>
      <button className="wl-lightbox__arrow wl-lightbox__arrow--next"
        onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); }}
        aria-label="Next">
        <i className="fa-solid fa-chevron-right" />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN SHOW PAGE
══════════════════════════════════════════ */
export default function ShowPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { currentUser, isHost } = useAuth();

  const [listing,     setListing]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState({ message: '', type: 'success' });
  const [rating,      setRating]      = useState(5);
  const [comment,     setComment]     = useState('');
  const [submitting,  setSub]         = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDone, setBookingDone] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/listings/${id}`)
      .then(r => setListing(r.data))
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const flash = (message, type = 'success') => setToast({ message, type });

  const handleDelete = async () => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await api.delete(`/listings/${id}`);
      navigate('/listings');
    } catch { flash('Failed to delete listing', 'error'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSub(true);
    try {
      const res = await api.post(`/listings/${id}/reviews`, { review: { rating, comment } });
      const enriched = { ...res.data, author: { _id: currentUser._id, username: currentUser.username, fullName: currentUser.fullName, role: currentUser.role } };
      setListing(p => ({ ...p, reviews: [...p.reviews, enriched] }));
      setComment(''); setRating(5);
      flash('Review added!');
    } catch { flash('Failed to add review', 'error'); }
    finally { setSub(false); }
  };

  const handleDeleteReview = async (rid) => {
    try {
      await api.delete(`/listings/${id}/reviews/${rid}`);
      setListing(p => ({ ...p, reviews: p.reviews.filter(r => r._id !== rid) }));
      flash('Review deleted');
    } catch { flash('Failed to delete review', 'error'); }
  };

  if (loading) return <div className="wl-spinner"><div className="wl-spin" /></div>;
  if (!listing) return null;

  const isOwner  = isHost && currentUser?._id && listing.owner?._id === currentUser._id;

  // Collect all image URLs — support both new images[] and legacy image
  const imgs = [];
  if (listing.images?.length) {
    listing.images.forEach(img => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url) imgs.push(url);
    });
  }
  if (!imgs.length && listing.image?.url) imgs.push(listing.image.url);
  const reviews  = listing.reviews ?? [];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;
  const nights1Price = Math.round(listing.price * 1.18);

  return (
    <div className="wl-show">
      <Toast message={toast.message} type={toast.type} onDone={() => setToast({ message: '' })} />

      {showBooking && (
        <BookingModal listing={listing} onClose={() => setShowBooking(false)}
          onSuccess={data => { setShowBooking(false); setBookingDone(data); flash('Booking confirmed! 🎉'); }} />
      )}

      {/* ── breadcrumb ── */}
      <nav className="wl-show__breadcrumb" aria-label="breadcrumb">
        <Link to="/listings">Explore</Link>
        <i className="fa-solid fa-chevron-right" />
        <span style={{ textTransform: 'capitalize' }}>{listing.category}</span>
        <i className="fa-solid fa-chevron-right" />
        <span>{listing.location}</span>
      </nav>

      {/* ── title + meta ── */}
      <div className="wl-show__header">
        <div className="wl-show__header-left">
          <h1 className="wl-show__title">{listing.title}</h1>
          <div className="wl-show__meta">
            {avgRating && (
              <span className="wl-show__meta-pill wl-show__meta-pill--star">
                <i className="fa-solid fa-star" />
                {avgRating.toFixed(1)}
                <span className="wl-show__meta-sep">·</span>
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </span>
            )}
            <span className="wl-show__meta-pill">
              <i className="fa-solid fa-location-dot" />
              {listing.location}, {listing.country}
            </span>
            {listing.category && (
              <span className="wl-show__meta-pill" style={{ textTransform: 'capitalize' }}>
                <i className="fa-solid fa-tag" />
                {listing.category}
              </span>
            )}
          </div>
        </div>

        {/* host actions */}
        {isOwner && (
          <div className="wl-show__host-actions">
            <Link to={`/listings/${listing._id}/edit`} className="wl-btn-outline">
              <i className="fa-solid fa-pen-to-square" /> Edit
            </Link>
            <button className="wl-btn-danger" onClick={handleDelete}>
              <i className="fa-solid fa-trash" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* ── photo grid ── */}
      <PhotoGrid imgs={imgs} />

      {/* ── two-col content ── */}
      <div className="wl-show__body">

        {/* LEFT */}
        <div className="wl-show__left">

          {/* host strip */}
          <div className="wl-show__host-strip">
            <div className="wl-show__host-avatar">
              {(listing.owner?.username?.[0] || 'H').toUpperCase()}
            </div>
            <div>
              <div className="wl-show__host-name">
                Hosted by <strong>{listing.owner?.username}</strong>
              </div>
              <div className="wl-show__host-sub">Host · StayNest</div>
            </div>
          </div>

          <hr className="wl-show__hr" />

          {/* highlights */}
          <div className="wl-show__highlights">
            <div className="wl-show__highlight">
              <i className="fa-solid fa-house" />
              <div>
                <div className="wl-show__hl-title">Entire place</div>
                <div className="wl-show__hl-sub">You'll have the space to yourself</div>
              </div>
            </div>
            <div className="wl-show__highlight">
              <i className="fa-solid fa-shield-halved" />
              <div>
                <div className="wl-show__hl-title">Enhanced clean</div>
                <div className="wl-show__hl-sub">Committed to clean standards</div>
              </div>
            </div>
            <div className="wl-show__highlight">
              <i className="fa-solid fa-medal" />
              <div>
                <div className="wl-show__hl-title">Great location</div>
                <div className="wl-show__hl-sub">{listing.location}, {listing.country}</div>
              </div>
            </div>
          </div>

          <hr className="wl-show__hr" />

          {/* description */}
          <div className="wl-show__desc-section">
            <h2 className="wl-show__section-title">About this place</h2>
            <p className="wl-show__desc">{listing.description}</p>
          </div>

          <hr className="wl-show__hr" />

          {/* map */}
          <div className="wl-show__map-section">
            <h2 className="wl-show__section-title">Where you&apos;ll be</h2>
            <p className="wl-show__map-sub">
              <i className="fa-solid fa-location-dot" style={{ marginRight: 5, color: 'var(--brand)' }} />
              {listing.location}, {listing.country}
            </p>
            {listing.geometry?.coordinates && (
              <LocationMap mode="view"
                coords={{ lat: listing.geometry.coordinates[1], lng: listing.geometry.coordinates[0] }}
                label={`${listing.title} · ${listing.location}`} />
            )}
          </div>

          <hr className="wl-show__hr" />

          {/* ══ REVIEWS ══ */}
          <div className="wl-show__reviews">

            {/* ── Summary header ── */}
            <div className="wl-rv-summary">
              <div className="wl-rv-summary__score">
                <span className="wl-rv-summary__num">
                  {avgRating ? avgRating.toFixed(1) : '—'}
                </span>
                <div className="wl-rv-summary__stars">
                  {[1,2,3,4,5].map(n => (
                    <i key={n}
                      className={`fa-star ${(avgRating||0) >= n ? 'fa-solid' : (avgRating||0) >= n-0.5 ? 'fa-solid' : 'fa-regular'}`}
                      style={{ color: avgRating ? '#ff385c' : '#ddd' }}
                    />
                  ))}
                </div>
                <span className="wl-rv-summary__count">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* rating bars — only if there are reviews */}
              {reviews.length > 0 && (() => {
                const cats = [
                  { label: 'Cleanliness',   icon: 'fa-soap' },
                  { label: 'Accuracy',      icon: 'fa-check-circle' },
                  { label: 'Location',      icon: 'fa-location-dot' },
                  { label: 'Value',         icon: 'fa-tag' },
                ];
                // Use overall avg for all bars (you can add per-category later)
                const pct = Math.round(((avgRating||0) / 5) * 100);
                return (
                  <div className="wl-rv-bars">
                    {cats.map(c => (
                      <div key={c.label} className="wl-rv-bar-row">
                        <span className="wl-rv-bar-label">{c.label}</span>
                        <div className="wl-rv-bar-track">
                          <div className="wl-rv-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="wl-rv-bar-val">{(avgRating||0).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* ── Review cards grid ── */}
            {reviews.length > 0 && (
              <div className="wl-rv-grid">
                {reviews.map(review => {
                  const initials = displayName(review.author).slice(0,2).toUpperCase();
                  const colors   = ['#ff385c','#00a699','#fc642d','#7b0051','#00d1c1','#ffb400'];
                  const colorIdx = (review.author?.username?.charCodeAt(0) || 0) % colors.length;
                  return (
                    <div key={review._id} className="wl-rv-card">
                      <div className="wl-rv-card__top">
                        <div className="wl-rv-card__avatar" style={{ background: colors[colorIdx] }}>
                          {initials}
                        </div>
                        <div className="wl-rv-card__meta">
                          <div className="wl-rv-card__name">
                            {displayName(review.author)}
                          </div>
                          <div className="wl-rv-card__date">
                            {new Date(review._id ? parseInt(review._id.substring(0,8),16)*1000 : Date.now())
                              .toLocaleDateString('en-IN',{ month:'long', year:'numeric' })}
                          </div>
                        </div>
                        {currentUser && review.author?._id === currentUser._id && (
                          <button className="wl-rv-card__del"
                            onClick={() => handleDeleteReview(review._id)}
                            aria-label="Delete review">
                            <i className="fa-solid fa-trash" />
                          </button>
                        )}
                      </div>

                      {/* inline stars */}
                      <div className="wl-rv-card__stars">
                        {[1,2,3,4,5].map(n => (
                          <i key={n} className={`fa-star ${n <= review.rating ? 'fa-solid' : 'fa-regular'}`} />
                        ))}
                      </div>

                      <p className="wl-rv-card__text">{review.comment}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Write a review ── */}
            {currentUser ? (
              <div className="wl-rv-form">
                <div className="wl-rv-form__header">
                  <div className="wl-rv-form__avatar"
                    style={{ background: '#ff385c' }}>
                    {displayName(currentUser).slice(0,1).toUpperCase()}
                  </div>
                  <div>
                    <div className="wl-rv-form__name">{displayName(currentUser)}</div>
                    <div className="wl-rv-form__sub">Write a public review</div>
                  </div>
                </div>

                <form onSubmit={handleReviewSubmit}>
                  {/* interactive stars */}
                  <div className="wl-field">
                    <label className="wl-label">Your rating</label>
                    <div className="wl-rv-star-pick">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button"
                          className={`wl-rv-star ${n <= rating ? 'active' : ''}`}
                          onClick={() => setRating(n)}
                          aria-label={`${n} star`}>
                          <i className="fa-solid fa-star" />
                        </button>
                      ))}
                      <span className="wl-rv-star-label">
                        {['','Terrible','Poor','Okay','Good','Excellent'][rating]}
                      </span>
                    </div>
                  </div>

                  <div className="wl-field">
                    <textarea className="wl-rv-textarea" rows={4}
                      value={comment} onChange={e => setComment(e.target.value)}
                      placeholder="What did you love (or not) about this place? Your honest review helps other travellers."
                      required />
                  </div>

                  <button type="submit" className="wl-rv-submit" disabled={submitting}>
                    {submitting
                      ? <><i className="fa-solid fa-circle-notch fa-spin" /> Posting…</>
                      : <><i className="fa-solid fa-paper-plane" /> Post review</>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="wl-rv-login">
                <div className="wl-rv-login__icon">
                  <i className="fa-regular fa-star" />
                </div>
                <div>
                  <div className="wl-rv-login__title">Share your experience</div>
                  <div className="wl-rv-login__sub">
                    <Link to="/login">Log in</Link> to leave a review for this listing.
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT — sticky booking card */}
        <div className="wl-show__right">
          <div className="wl-book-box">
            <div className="wl-book-box__price">
              &#8377;{Number(listing.price).toLocaleString('en-IN')}
              <span> / night</span>
            </div>

            {avgRating && (
              <div className="wl-book-box__rating">
                <i className="fa-solid fa-star" />
                {avgRating.toFixed(1)}
                <span className="wl-book-box__reviews">· {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* reserve / confirmed */}
            <div className="wl-book-box__cta">
              {bookingDone ? (
                <div className="wl-booking-confirmed">
                  <i className="fa-solid fa-circle-check" />
                  <div>
                    <div style={{ fontWeight: 700 }}>Booking Confirmed!</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--ink-soft)', marginTop: 2 }}>
                      {bookingDone.nights} night{bookingDone.nights > 1 ? 's' : ''} &nbsp;·&nbsp;
                      ₹{bookingDone.totalPrice?.toLocaleString('en-IN')} total
                    </div>
                  </div>
                </div>
              ) : currentUser ? (
                <button className="wl-btn-primary" onClick={() => setShowBooking(true)}>
                  Reserve
                </button>
              ) : (
                <Link to="/login" className="wl-btn-primary" style={{ textAlign: 'center' }}>
                  Log in to reserve
                </Link>
              )}
            </div>

            <p className="wl-book-box__note">You won&apos;t be charged yet</p>

            <hr className="wl-book-box__divider" />

            <div className="wl-book-box__row">
              <span>₹{Number(listing.price).toLocaleString('en-IN')} × 1 night</span>
              <span>₹{Number(listing.price).toLocaleString('en-IN')}</span>
            </div>
            <div className="wl-book-box__row">
              <span>GST &amp; taxes (18%)</span>
              <span>₹{Math.round(listing.price * 0.18).toLocaleString('en-IN')}</span>
            </div>
            <hr className="wl-book-box__divider" />
            <div className="wl-book-box__row wl-book-box__row--total">
              <span>Total before taxes</span>
              <span>₹{nights1Price.toLocaleString('en-IN')}</span>
            </div>

            <div className="wl-book-box__host">
              <div className="wl-book-box__host-avatar">
                {(listing.owner?.username?.[0] || 'H').toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '.8rem', color: 'var(--ink-soft)' }}>Hosted by</div>
                <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{listing.owner?.username}</div>
              </div>
            </div>
          </div>

          {/* report / share */}
          <div className="wl-book-box__actions">
            <button className="wl-show__action-btn">
              <i className="fa-solid fa-share-nodes" /> Share
            </button>
            <button className="wl-show__action-btn">
              <i className="fa-regular fa-flag" /> Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
