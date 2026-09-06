import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const FALLBACK =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60';

/** Collect all image URLs for a listing (new multi + legacy single) */
function getImages(listing) {
  if (listing.images?.length) return listing.images.map(i => i.url).filter(Boolean);
  if (listing.image?.url)     return [listing.image.url];
  return [FALLBACK];
}

export default function ListingCard({ listing, showTax }) {
  const [wished,   setWished]   = useState(false);
  const [slide,    setSlide]    = useState(0);
  const [imgError, setImgError] = useState({});

  const images   = getImages(listing);
  const total    = images.length;
  const price    = Number(listing.price) || 0;
  const taxPrice = Math.round(price * 1.18);

  const reviews   = listing.reviews ?? [];
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : null;

  const prev = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setSlide(s => (s - 1 + total) % total);
  }, [total]);

  const next = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setSlide(s => (s + 1) % total);
  }, [total]);

  const imgSrc = imgError[slide] ? FALLBACK : (images[slide] || FALLBACK);

  return (
    <div className="wl-card">
      {/* ── image carousel ── */}
      <div className="wl-card__img-wrap">

        <img
          className="wl-card__img"
          src={imgSrc}
          alt={listing.title || 'Listing'}
          onError={() => setImgError(p => ({ ...p, [slide]: true }))}
        />

        {/* overlay link — whole image goes to detail page */}
        <Link
          to={`/listings/${listing._id}`}
          className="wl-card__img-link"
          aria-label={listing.title}
        />

        {/* prev / next arrows — only show when multiple images */}
        {total > 1 && (
          <>
            <button
              className="wl-card__arrow wl-card__arrow--prev"
              onClick={prev}
              aria-label="Previous photo"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button
              className="wl-card__arrow wl-card__arrow--next"
              onClick={next}
              aria-label="Next photo"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </>
        )}

        {/* dot indicators */}
        {total > 1 && (
          <div className="wl-card__dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={`wl-card__dot ${i === slide ? 'active' : ''}`}
              />
            ))}
          </div>
        )}

        {/* category badge */}
        {listing.category && (
          <span className="wl-card__badge">{listing.category}</span>
        )}

        {/* heart button */}
        <button
          className="wl-card__heart"
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={e => { e.stopPropagation(); setWished(p => !p); }}
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
      </div>

      {/* ── card body ── */}
      <Link to={`/listings/${listing._id}`} className="wl-card__body">
        <div className="wl-card__top-row">
          <div className="wl-card__title">{listing.title}</div>
          {avgRating && (
            <div className="wl-card__rating">
              <i className="fa-solid fa-star" />
              {avgRating}
            </div>
          )}
        </div>

        <div className="wl-card__location">
          {listing.location}, {listing.country}
        </div>

        <div className="wl-card__footer">
          <div className="wl-card__price">
            &#8377;{price.toLocaleString('en-IN')}
            <span> / night</span>
          </div>
          {showTax && (
            <div className="wl-card__gst">
              &#8377;{taxPrice.toLocaleString('en-IN')} total w/ taxes
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
