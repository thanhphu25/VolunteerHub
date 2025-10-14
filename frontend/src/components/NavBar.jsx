import {Link} from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
      <nav className="navbar">
        <h2>🌿 VolunteerHub</h2>
        <ul>
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/events">Sự kiện</Link></li>
          <li><Link to="/login">Đăng nhập</Link></li>
          <li><Link to="/register">Đăng ký</Link></li>
        </ul>
      </nav>
  );
}

export default Navbar;
