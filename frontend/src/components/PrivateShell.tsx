import { Link, useLocation } from "react-router-dom";
import { clearToken } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import "./PrivateGate.css";

interface Props {
  children: React.ReactNode;
}

export default function PrivateShell({ children }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/admin");
  };

  return (
    <div className="private-shell">
      <nav className="private-nav">
        <Link to="/admin" className={pathname.startsWith("/admin") ? "active" : ""}>Admin</Link>
        <Link to="/private/inspiration" className={pathname === "/private/inspiration" ? "active" : ""}>Inspiration</Link>
        <span className="private-nav-spacer" />
        <Link to="/">← Site</Link>
        <button type="button" onClick={handleLogout}>Sign out</button>
      </nav>
      {children}
    </div>
  );
}
