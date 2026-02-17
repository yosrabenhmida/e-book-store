import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    role: "client",
    createdAt: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderNotifications: true,
    newsletterNotifications: false,
    securityAlerts: true,
  });

  // Récupérer les données du profil au chargement
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:3001/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProfileData({
        username: response.data.username || response.data.name || "",
        email: response.data.email || "",
        role: response.data.role || "client",
        createdAt: response.data.createdAt || new Date().toISOString(),
      });

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Impossible de charger le profil");
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    setError("");
    setSuccessMessage("");
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    setError("");
    setSuccessMessage("");
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  const handleSaveProfile = async () => {
    try {
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:3001/api/users/profile",
        {
          name: profileData.username,
          email: profileData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccessMessage("Profil mis à jour avec succès !");
      setIsEditing(false);

      // Mettre à jour le nom dans localStorage
      if (profileData.username) {
        localStorage.setItem("name", profileData.username);
      }

      // Actualiser les données
      setTimeout(() => {
        setSuccessMessage("");
        fetchProfile();
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du profil",
      );
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:3001/api/users/password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccessMessage("Mot de passe modifié avec succès !");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      setError(
        error.response?.data?.message ||
          "Erreur lors du changement de mot de passe",
      );
    }
  };

  const handleAvatarChange = () => {
    alert("Fonctionnalité de changement d'avatar à implémenter");
  };

  const tabs = [
    { id: "general", label: "Informations", icon: "👤" },
    { id: "security", label: "Sécurité", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
  ];

  // Affichage du loader
  if (loading) {
    return (
      <div className="profile-container">
        <Navbar />
        <div className="profile-content">
          <div className="loading-state">
            <div className="loader"></div>
            <p>Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Navbar />

      <div className="profile-content">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-banner">
            <div className="banner-gradient"></div>
          </div>
          <div className="profile-header-content">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                <img
                  src={`https://ui-avatars.com/api/?name=${profileData.username}&size=200&background=667eea&color=fff&bold=true`}
                  alt="Profile"
                  className="profile-avatar"
                />
                <button
                  className="avatar-edit-btn"
                  onClick={handleAvatarChange}
                  aria-label="Changer l'avatar"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M14.5 2.5a2.121 2.121 0 0 1 3 3L6 17l-4 1 1-4L14.5 2.5z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className="profile-info">
                <h1 className="profile-name">{profileData.username}</h1>
                <p className="profile-role">
                  {profileData.role === "admin" ? "Administrateur" : "Client"}
                </p>
                <div className="profile-meta">
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M8 5v3l2 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Membre depuis{" "}
                    {new Date(profileData.createdAt).toLocaleDateString(
                      "fr-FR",
                      {
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </span>
                  <span className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M2 4h12M2 8h12M2 12h12"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                    {profileData.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages d'erreur et succès */}
        {error && (
          <div className="message-alert error-alert">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M10 6v4M10 14h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="message-alert success-alert">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M6 10l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Informations personnelles</h2>
                {!isEditing ? (
                  <button
                    className="btn-edit"
                    onClick={() => setIsEditing(true)}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M13 2a2.121 2.121 0 0 1 3 3L5 16l-4 1 1-4L13 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Modifier
                  </button>
                ) : (
                  <div className="btn-group">
                    <button
                      className="btn-cancel"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </button>
                    <button className="btn-save" onClick={handleSaveProfile}>
                      Sauvegarder
                    </button>
                  </div>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nom d'utilisateur</label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Rôle</label>
                  <input
                    type="text"
                    value={
                      profileData.role === "admin" ? "Administrateur" : "Client"
                    }
                    disabled
                    className="readonly-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Sécurité et mot de passe</h2>
              </div>

              <form onSubmit={handleSavePassword} className="security-form">
                <div className="form-group">
                  <label>Mot de passe actuel</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Entrez votre mot de passe actuel"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nouveau mot de passe</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Minimum 6 caractères"
                    required
                    minLength="6"
                  />
                </div>
                <div className="form-group">
                  <label>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirmez le nouveau mot de passe"
                    required
                  />
                </div>
                <button type="submit" className="btn-save">
                  Mettre à jour le mot de passe
                </button>
              </form>

              <div className="security-info">
                <div className="info-card">
                  <div className="info-icon">🔐</div>
                  <div className="info-content">
                    <h3>Authentification à deux facteurs</h3>
                    <p>
                      Ajoutez une couche de sécurité supplémentaire à votre
                      compte
                    </p>
                    <button className="btn-secondary" disabled>
                      Bientôt disponible
                    </button>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon">📱</div>
                  <div className="info-content">
                    <h3>Sessions actives</h3>
                    <p>Gérez les appareils connectés à votre compte</p>
                    <button className="btn-secondary" disabled>
                      Bientôt disponible
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="tab-panel">
              <div className="panel-header">
                <h2>Préférences de notifications</h2>
              </div>

              <div className="notifications-settings">
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Notifications par email</h3>
                    <p>Recevoir des emails pour les événements importants</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={() =>
                        handleNotificationChange("emailNotifications")
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Alertes de commandes</h3>
                    <p>Notifications pour les nouvelles commandes</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.orderNotifications}
                      onChange={() =>
                        handleNotificationChange("orderNotifications")
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Newsletter</h3>
                    <p>Recevoir les actualités et promotions</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.newsletterNotifications}
                      onChange={() =>
                        handleNotificationChange("newsletterNotifications")
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Alertes de sécurité</h3>
                    <p>Notifications pour les activités suspectes</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificationSettings.securityAlerts}
                      onChange={() =>
                        handleNotificationChange("securityAlerts")
                      }
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
