import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, isHost, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setSearchParams] = useSearchParams();

  const handleLogout = async () => {
    await logout();
    navigate('/listings');
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.elements.q.value.trim();
    if (q) {
      navigate(`/listings?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/listings');
    }
    setMenuOpen(false);
  };

  const SearchForm = () => (
    <form className="wl-search" onSubmit={handleSearch}>
      <i className="fa-solid fa-magnifying-glass wl-search__icon" />
      <input
        name="q"
        className="wl-search__input"
        type="search"
        placeholder="Search destinations, cities…"
        autoComplete="off"
      />
    </form>
  );

  return (
    <>
      <nav className="wl-nav">
        {/* Logo */}
        <Link to="/listings" className="wl-nav__logo">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 2C10 10 6 14.5 6 18.5a10 10 0 0 0 20 0C26 14.5 22 10 16 2z
                 M16 27a8.5 8.5 0 0 1-8.5-8.5C7.5 15 11 11 16 4.5 21 11 24.5 15 24.5 18.5A8.5 8.5 0 0 1 16 27z"
              fill="#ff385c"
            />
          </svg>
          StayNest
        </Link>

        {/* Desktop search */}
        <div className="wl-nav__search-wrap" style={{ flex: 1, maxWidth: 480, margin: '0 1.5rem' }}>
          <SearchForm />
        </div>

        {/* Desktop links */}
        <div className="wl-nav__links">
          {/* Only hosts can list a place */}
          {isHost && (
            <Link className="wl-nav__link" to="/listings/new">
              <i className="fa-solid fa-plus" style={{ marginRight: 6 }} />
              List your place
            </Link>
          )}

          {!currentUser ? (
            <>
              <Link className="wl-nav__link" to="/signup">Become a host</Link>
              <Link className="wl-nav__link wl-nav__link--cta" to="/login">Log in</Link>
            </>
          ) : (
            <>
              <span className="wl-nav__link" style={{ cursor: 'default' }}>
                {currentUser.role === 'host'
                  ? <><i className="fa-solid fa-house" style={{ marginRight: 5, color: 'var(--brand)' }} />Hi, {currentUser.username}</>
                  : <><i className="fa-solid fa-user" style={{ marginRight: 5 }} />Hi, {currentUser.fullName?.trim() || currentUser.username}</>
                }
              </span>
              <button className="wl-nav__link" onClick={handleLogout}>Log out</button>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button className="wl-nav__burger" onClick={() => setMenuOpen(p => !p)} aria-label="menu">
          <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div className={`wl-nav__mobile ${menuOpen ? 'open' : ''}`}>
        <SearchForm />
        <Link className="wl-nav__link" to="/listings" onClick={() => setMenuOpen(false)}>Explore</Link>
        {isHost && (
          <Link className="wl-nav__link" to="/listings/new" onClick={() => setMenuOpen(false)}>List your place</Link>
        )}
        {!currentUser ? (
          <>
            <Link className="wl-nav__link" to="/signup" onClick={() => setMenuOpen(false)}>Become a host</Link>
            <Link className="wl-nav__link wl-nav__link--cta" to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
          </>
        ) : (
          <button className="wl-nav__link" onClick={handleLogout}>Log out</button>
        )}
      </div>
    </>
  );
}
