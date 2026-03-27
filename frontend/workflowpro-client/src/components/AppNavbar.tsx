import { useNavigate } from "react-router-dom";
import { clearAuth } from "../utils/auth";

export default function AppNavbar() {
  const navigate = useNavigate();

  const fullName = localStorage.getItem("fullName") || "User";
  const role = localStorage.getItem("role") || "Member";

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg wf-navbar sticky-top">
      <div className="container">
        <div className="d-flex align-items-center gap-3">
          <div className="wf-logo">W</div>
          <div>
            <div className="navbar-brand mb-0 fw-bold">WorkFlowPro</div>
            <div className="wf-navbar-subtitle">
              Project management workspace
            </div>
          </div>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="wf-user-badge">
            <div className="wf-user-avatar">
              {fullName.charAt(0).toUpperCase()}
            </div>

            <div className="text-start">
              <div className="fw-semibold small">{fullName}</div>
              <div className="text-muted small">{role}</div>
            </div>
          </div>

          <button className="btn btn-dark btn-sm px-3" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
