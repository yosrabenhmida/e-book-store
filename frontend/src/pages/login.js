import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        "http://localhost:3001/api/users/login",
        formData,
      );
      setMessage("Connexion réussie !");
      setIsSuccess(true);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.username);
      localStorage.setItem("role", res.data.role);
      setTimeout(() => {
        if (res.data.role === "admin") navigate("/dashboardAdmin");
        else navigate("/");
      }, 1200);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Email ou mot de passe incorrect",
      );
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Orbs animés */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      {/* Grille de fond */}
      <div className="auth-grid" />

      {/* Logo */}
      <div className="auth-logo" onClick={() => navigate("/")}>
        <span className="auth-logo-icon">📚</span>
        <span className="auth-logo-text">E-Book Store</span>
      </div>

      <div className="auth-card">
        {/* Bordure animée */}
        <div className="auth-card-glow" />

        <div className="auth-header">
          <div className="auth-icon-wrap">
            <span className="auth-icon">🔐</span>
          </div>
          <h2 className="auth-title">Connexion</h2>
          <p className="auth-subtitle">
            Bienvenue ! Accédez à votre bibliothèque
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div
            className={`auth-field ${focused === "email" ? "focused" : ""} ${formData.email ? "filled" : ""}`}
          >
            <label>Email</label>
            <div className="auth-input-wrap">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 0l7 5 7-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="email"
                name="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                required
              />
            </div>
          </div>

          <div
            className={`auth-field ${focused === "password" ? "focused" : ""} ${formData.password ? "filled" : ""}`}
          >
            <label>Mot de passe</label>
            <div className="auth-input-wrap">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect
                  x="3"
                  y="9"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M7 9V6a3 3 0 016 0v3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                required
              />
            </div>
          </div>

          {message && (
            <div
              className={`auth-msg ${isSuccess ? "auth-msg-success" : "auth-msg-error"}`}
            >
              <span>{isSuccess ? "✅" : "⚠️"}</span>
              {message}
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="auth-btn-spinner" />
            ) : (
              <>
                Se connecter <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <div className="auth-footer">
          <p>Pas encore de compte ?</p>
          <Link to="/register" className="auth-link-btn">
            Créer un compte gratuit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
