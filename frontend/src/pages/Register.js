import React, { useState } from "react";
import "./Register.css";
import axios from "axios";
const App = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3001/api/users/register",
        formData,
      );
      setMessage(response.data.msg);
    } catch (error) {
      setMessage(error.response?.data?.msg || "Une erreur est survenue");
      setIsSuccess(false);
    }
  };
  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2 className="register-title">Créer un compte</h2>
          <p className="register-subtitle">Rejoignez-nous dès aujourd'hui</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label className="form-label">Nom d'utilisateur</label>
            <input
              type="text"
              name="username"
              placeholder="Entrez votre nom d'utilisateur"
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

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
              placeholder="Créez un mot de passe sécurisé"
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
            S'inscrire
          </button>
        </form>

        <div className="register-footer">
          <p>
            Vous avez déjà un compte?{" "}
            <a href="/login" className="register-link">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
