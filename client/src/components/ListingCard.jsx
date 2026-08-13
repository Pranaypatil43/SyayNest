import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Airbnb-style listing card.
 * Props:
 *   listing  – listing object from the API
 *   showTax  – boolean, show +18% GST line
 */
const FALLBACK = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60';

export default function ListingCard({ listing, showTax }) {
  const [wished, setWished] = useState(false);
  
  const imgSrc = listing.image?.url || FALLBACK;
  const price  = Number(listing.price) || 0;
  const taxPrice = Math.round(price * 1.18);

  /* average rating from populated reviews (may be missing on list view) */
  const reviews = listing.reviews ?? [];
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="wl-card" style={{ position: 'relative' }}>
      {/* ── image wrap ── */}
      <Link to={`/listings/${listing._id}`} className="wl-card__img-wrap" aria-label={listing.title}>
        <img
          className="wl-card__img"
          src={imgSrc}
          alt={listing.title}
          loading="lazy"
        />
        {listing.category && (
          <span className="wl-card__badge">{listing.category}</span>
        )}
      </Link>

      {/* ── heart / wishlist button ── */}
      <button
        className="wl-card__heart"
        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={e => { e.preventDefault(); setWished(p => !p); }}
      >
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M16 28c-.5 0-1-.2-1.4-.5C4 19.4 2 14.8 2 11.5 2 7.4 5.4 4 9.5 4c2.2 0 4.3 1 5.7 2.7a.8.8 0 0 0 1.6 0C18.2 5 20.3 4 22.5 4 26.6 4 30 7.4 30 11.5c0 3.3-2 7.9-12.6 16a2 2 0 0 1-1.4.5z"
            fill={wished ? '#ff385c' : 'none'}
            stroke={wished ? '#ff385c' : '#fff'}
            strokeWidth="2"
          />
        </svg>
      </button>

      {/* ── card body ── */}
      <Link to={`/listings/${listing._id}`} className="wl-card__body" style={{ display: 'block', textDecoration: 'none' }}>
        {/* title row + rating */}
        <div className="wl-card__top-row">
          <div className="wl-card__title">{listing.title}</div>
          {avgRating && (
            <div className="wl-card__rating">
              <i className="fa-solid fa-star" />
              {avgRating}
            </div>
          )}
        </div>

        {/* location */}
        <div className="wl-card__location">
          {listing.location}, {listing.country}
        </div>

        {/* price */}
        <div className="wl-card__footer">
          <div className="wl-card__price">
            &#8377;{price.toLocaleString('en-IN')}
            <span> / night</span>
          </div>
          {showTax && (
            <div className="wl-card__gst">
              &#8377;{taxPrice.toLocaleString('en-IN')} total w/ GST
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
