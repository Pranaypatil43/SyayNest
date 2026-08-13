import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 300);
    }, 3200);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message || !visible) return null;

  return (
    <div className="wl-toast-wrap">
      <div className={`wl-toast wl-toast--${type}`}>
        <i className={`fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
        {message}
        <button className="wl-toast__close" onClick={() => setVisible(false)}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  );
}
