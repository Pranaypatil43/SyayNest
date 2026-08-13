export default function Footer() {
  return (
    <footer className="wl-footer">
      <div>
        <div className="wl-footer__brand">StayNest</div>
        <div style={{ marginTop: 4 }}>© 2026 StayNest Private Limited</div>
      </div>

      <div className="wl-footer__socials">
        <i className="fa-brands fa-facebook" />
        <i className="fa-brands fa-instagram" />
        <i className="fa-brands fa-linkedin" />
        <i className="fa-brands fa-x-twitter" />
      </div>

      <div className="wl-footer__links">
        <a href="#">Terms</a>
        <a href="#">Privacy</a>
        <a href="#">Support</a>
      </div>
    </footer>
  );
}
