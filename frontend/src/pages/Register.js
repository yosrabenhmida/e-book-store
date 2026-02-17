import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
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
      const response = await axios.post(
        "http://localhost:3001/api/users/register",
        formData,
      );
      setMessage(response.data.msg);
      setIsSuccess(true);
    } catch (error) {
      setMessage(error.response?.data?.msg || "Une erreur est survenue");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <div className="auth-grid" />

      <div className="auth-logo" onClick={() => navigate("/")}>
        <span className="auth-logo-icon">📚</span>
        <span className="auth-logo-text">E-Book Store</span>
      </div>

      <div className="auth-card">
        <div className="auth-card-glow" />

        <div className="auth-header">
          <div className="auth-icon-wrap">
            <span className="auth-icon">✨</span>
          </div>
          <h2 className="auth-title">Créer un compte</h2>
          <p className="auth-subtitle">Rejoignez-nous dès aujourd'hui</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* ── Nom d'utilisateur ── */}
          <div
            className={`auth-field ${focused === "username" ? "focused" : ""} ${formData.username ? "filled" : ""}`}
          >
            <label>Nom d'utilisateur</label>
            <div className="auth-input-wrap">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                name="username"
                placeholder="Entrez votre nom d'utilisateur"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocused("username")}
                onBlur={() => setFocused("")}
                required
              />
            </div>
          </div>

          {/* ── Email ── */}
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

          {/* ── Mot de passe ── */}
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
                placeholder="Créez un mot de passe sécurisé"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                required
              />
            </div>
          </div>

          {/* ── Message ── */}
          {message && (
            <div
              className={`auth-msg ${isSuccess ? "auth-msg-success" : "auth-msg-error"}`}
            >
              <span>{isSuccess ? "✅" : "⚠️"}</span>
              {message}
            </div>
          )}

          {/* ── Bouton ── */}
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? (
              <span className="auth-btn-spinner" />
            ) : (
              <>
                S'inscrire <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <div className="auth-footer">
          <p>Vous avez déjà un compte ?</p>
          <Link to="/login" className="auth-link-btn">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
