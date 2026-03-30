import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import type { AuthResponse, LoginRequest } from "../types/auth";
import { saveAuth } from "../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post<AuthResponse>("/Auth/login", form);
      const data = response.data;

      saveAuth(
        data.userId,
        data.token,
        data.fullName,
        data.email,
        data.role,
        data.tenantId,
      );

      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wf-auth-wrapper">
      <div className="wf-auth-card wf-card p-4 p-md-5">
        <div className="text-center mb-4">
          <h1 className="wf-title mb-2">WorkFlowPro</h1>
          <p className="wf-subtitle mb-0">Sign in to your workspace</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              name="email"
              className="form-control form-control-lg"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              name="password"
              className="form-control form-control-lg"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-dark btn-lg w-100"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <div className="alert alert-light border mt-3 mb-0">
            <div className="fw-semibold mb-1">Demo account</div>
            <div>Email: hasan@example.com</div>
            <div>Password: 123456</div>
          </div>
        </form>
      </div>
    </div>
  );
}
