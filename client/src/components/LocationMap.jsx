/**
 * LocationMap
 * -----------
 * Two modes:
 *   mode="picker"  – interactive map with a draggable marker.
 *                    Shows a search box that geocodes with Nominatim.
 *                    Calls onCoordsChange({ lat, lng }) whenever the pin moves.
 *
 *   mode="view"    – read-only map centred on the supplied coords.
 *
 * Props (picker):
 *   coords        { lat, lng }   current pin position
 *   onCoordsChange(coords)       callback
 *   defaultLocation  string      pre-fill the search box (e.g. "Manali, India")
 *
 * Props (view):
 *   coords        { lat, lng }
 *   label         string         popup text
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ── fix the broken default icon paths that Vite/webpack cause ── */
import markerIcon2x   from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon     from 'leaflet/dist/images/marker-icon.png';
import markerShadow   from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

/* custom red pin for StayNest */
const redPin = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: markerShadow,
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
});

/* ── Nominatim geocoder (free, no key needed) ── */
async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  return res.json();
}

/* ────────────────────────────────────────────── */

export default function LocationMap({
  mode = 'view',
  coords,
  onCoordsChange,
  defaultLocation = '',
  label = '',
}) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markerRef    = useRef(null);

  const [search,      setSearch]      = useState(defaultLocation);
  const [suggestions, setSuggestions] = useState([]);
  const [searching,   setSearching]   = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  /* ── init map once ── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const lat = coords?.lat ?? 20.5937;
    const lng = coords?.lng ?? 78.9629;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: coords ? 13 : 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      icon: redPin,
      draggable: mode === 'picker',
    }).addTo(map);

    if (label) {
      marker.bindPopup(`<b>${label}</b>`).openPopup();
    }

    if (mode === 'picker') {
      /* drag */
      marker.on('dragend', () => {
        const { lat: la, lng: ln } = marker.getLatLng();
        onCoordsChange?.({ lat: la, lng: ln });
      });
      /* click on map to move pin */
      map.on('click', e => {
        const { lat: la, lng: ln } = e.latlng;
        marker.setLatLng([la, ln]);
        onCoordsChange?.({ lat: la, lng: ln });
      });
    }

    mapRef.current    = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current    = null;
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── keep marker in sync when coords prop changes (e.g. geocode result) ── */
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !coords) return;
    markerRef.current.setLatLng([coords.lat, coords.lng]);
    mapRef.current.flyTo([coords.lat, coords.lng], 13, { duration: 1 });
  }, [coords]);

  /* ── debounced search as user types ── */
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearch(val);
    setSuggestions([]);

    if (debounceTimer) clearTimeout(debounceTimer);
    if (val.trim().length < 3) return;

    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await geocode(val);
        setSuggestions(results.slice(0, 5));
      } catch { /* ignore */ }
      finally { setSearching(false); }
    }, 500);
    setDebounceTimer(t);
  };

  const pickSuggestion = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setSearch(place.display_name);
    setSuggestions([]);
    onCoordsChange?.({ lat, lng });
  };

  /* ── view mode — just render the map ── */
  if (mode === 'view') {
    return (
      <div
        ref={containerRef}
        style={{
          height: 320,
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          border: '1.5px solid var(--border)',
          zIndex: 0,
        }}
      />
    );
  }

  /* ── picker mode ── */
  return (
    <div style={{ position: 'relative' }}>
      {/* search box */}
      <div className="lm-search-wrap">
        <div style={{ position: 'relative' }}>
          <i className="fa-solid fa-magnifying-glass lm-search-icon" />
          <input
            type="text"
            className="wl-input lm-search-input"
            placeholder="Search location… e.g. Manali, Himachal Pradesh"
            value={search}
            onChange={handleSearchInput}
            autoComplete="off"
          />
          {searching && (
            <span className="lm-search-spin">
              <div className="wl-spin" style={{ width: 16, height: 16, borderWidth: 2 }} />
            </span>
          )}
        </div>

        {suggestions.length > 0 && (
          <ul className="lm-suggestions">
            {suggestions.map((s, i) => (
              <li key={i} onClick={() => pickSuggestion(s)} className="lm-suggestion-item">
                <i className="fa-solid fa-location-dot" style={{ color: 'var(--brand)', marginRight: 8, flexShrink: 0 }} />
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* map */}
      <div
        ref={containerRef}
        style={{
          height: 320,
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          border: '1.5px solid var(--border)',
          zIndex: 0,
        }}
      />
      <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: 6 }}>
        Search a location above, or click/drag the pin on the map to set it precisely.
      </p>
    </div>
  );
}
