import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ListingCard from '../components/ListingCard';

const CATEGORIES = [
  { value: '',           label: 'All',           icon: 'fa-solid fa-border-all' },
  { value: 'trending',   label: 'Trending',       icon: 'fa-solid fa-fire' },
  { value: 'rooms',      label: 'Rooms',           icon: 'fa-solid fa-bed' },
  { value: 'iconic',     label: 'Iconic Cities',   icon: 'fa-solid fa-city' },
  { value: 'mountains',  label: 'Mountains',       icon: 'fa-solid fa-mountain' },
  { value: 'beachfront', label: 'Beachfront',      icon: 'fa-solid fa-umbrella-beach' },
  { value: 'pools',      label: 'Amazing Pools',   icon: 'fa-solid fa-water-ladder' },
  { value: 'farms',      label: 'Farms',           icon: 'fa-solid fa-tractor' },
  { value: 'arctic',     label: 'Arctic',          icon: 'fa-regular fa-snowflake' },
  { value: 'views',      label: 'Amazing Views',   icon: 'fa-solid fa-eye' },
];

export default function ListingsPage() {
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showTax, setShowTax]         = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const query    = (searchParams.get('search')   || '').toLowerCase().trim();

  useEffect(() => {
    setLoading(true);
    const params = category ? { category } : {};
    api.get('/listings', { params })
      .then(r => setAllListings(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  const listings = useMemo(() => {
    if (!query) return allListings;
    return allListings.filter(l =>
      l.title?.toLowerCase().includes(query)    ||
      l.location?.toLowerCase().includes(query) ||
      l.country?.toLowerCase().includes(query)  ||
      l.description?.toLowerCase().includes(query)
    );
  }, [allListings, query]);

  const setCategory = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('category', val); else next.delete('category');
    next.delete('search');
    setSearchParams(next);
  };

  return (
    <>
      {/* ── filter bar ── */}
      <div className="wl-filters">
        <div className="wl-filters__cats">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className={`wl-filter-btn ${category === cat.value ? 'active' : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              <i className={cat.icon} />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="wl-tax-toggle">
          <label className="wl-toggle-switch">
            <input
              type="checkbox"
              checked={showTax}
              onChange={() => setShowTax(p => !p)}
            />
            <span className="wl-toggle-slider" />
          </label>
          Show taxes
        </div>
      </div>

      {/* ── search feedback ── */}
      {query && !loading && (
        <div style={{ padding: '1rem 2.5rem 0', color: 'var(--ink-soft)', fontSize: '0.875rem' }}>
          {listings.length} result{listings.length !== 1 ? 's' : ''} for{' '}
          &ldquo;<b>{query}</b>&rdquo;&nbsp;
          <button
            style={{
              background: 'none', border: 'none', color: 'var(--brand)',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
            }}
            onClick={() => {
              const n = new URLSearchParams(searchParams);
              n.delete('search');
              setSearchParams(n);
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* ── grid ── */}
      <div className="wl-grid-wrap">
        {loading ? (
          <div className="wl-spinner"><div className="wl-spin" /></div>
        ) : listings.length === 0 ? (
          <div className="wl-no-results">
            <i className="fa-solid fa-face-frown-open" />
            <p style={{ fontFamily: 'Fraunces,serif', fontSize: '1.3rem', marginBottom: 6 }}>
              No listings found
            </p>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div className="wl-grid">
            {listings.map(listing => (
              <ListingCard
                key={listing._id}
                listing={listing}
                showTax={showTax}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
