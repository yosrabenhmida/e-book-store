import React, { useState } from "react";
import axios from "axios";
import "./login.css";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3001/api/users/login",
        formData,
      );

      setMessage("Connexion réussie !");

      setIsSuccess(true);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        // Rediriger vers la page d'accueil après connexion réussie
        setTimeout(() => {
          navigate("/dashboardAdmin"); // ou "/" selon votre route
        }, 1500);
      }

      localStorage.setItem("name", res.data.username);
      //navigate("/home");
    } catch (error) {
      setMessage(error.response?.data?.message || "Une erreur est survenue");
      setIsSuccess(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Connexion</h2>
          <p className="login-subtitle">
            Bienvenue! Connectez-vous à votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="Entrez votre mot de passe"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          {message && (
            <p className={isSuccess ? "success-message" : "error-message"}>
              {message}
            </p>
          )}

          <button type="submit" className="submit-button">
            Se connecter
          </button>
        </form>

        <div className="login-footer">
          <p>
            Vous n'avez pas de compte?{" "}
            <Link to="/" className="login-link">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
