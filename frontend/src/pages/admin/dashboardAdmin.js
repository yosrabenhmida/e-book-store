import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./../../components/layout/Navbar";
import "./dashboardAdmin.css";

const API = "http://localhost:3001/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

const DashboardAdmin = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalClients: 0,
    totalLivres: 0,
    totalOrders: 0,
    revenus: 0,
    enAttente: 0,
    confirmes: 0,
    annules: 0,
    livresRecents: [],
    ordersRecents: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const headers = getAuthHeader();

        const [clientsRes, livresRes, ordersRes] = await Promise.all([
          axios.get(`${API}/users/clients`, headers),
          axios.get(`${API}/books`),
          axios.get(`${API}/orders`, headers),
        ]);

        const clients = clientsRes.data;
        const livres = livresRes.data;
        const orders = ordersRes.data;

        const revenus = orders
          .filter((o) => o.status === "Confirmé")
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

        setStats({
          totalClients: clients.length,
          totalLivres: livres.length,
          totalOrders: orders.length,
          revenus,
          enAttente: orders.filter((o) => o.status === "En attente").length,
          confirmes: orders.filter((o) => o.status === "Confirmé").length,
          annules: orders.filter((o) => o.status === "Annulé").length,
          livresRecents: livres.slice(-3).reverse(),
          ordersRecents: orders.slice(0, 5),
        });
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <main className="dashboard-main">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "60vh",
              gap: "1rem",
              color: "#7b82b0",
            }}
          >
            <div className="loader"></div>
            <p>Chargement du tableau de bord...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />

      <main className="dashboard-main">
        {/* Welcome */}
        <div className="welcome-section">
          <h2>Bienvenue dans votre espace administrateur</h2>
          <p>Voici un résumé en temps réel de votre activité</p>
        </div>

        {/* Stats principales */}
        <div className="dashboard-grid">
          {/* Clients */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/admin/clients")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 24C28.4183 24 32 20.4183 32 16C32 11.5817 28.4183 8 24 8C19.5817 8 16 11.5817 16 16C16 20.4183 19.5817 24 24 24Z"
                  fill="url(#g1)"
                />
                <path
                  d="M40 40C40 32.268 32.836 26 24 26C15.164 26 8 32.268 8 40"
                  stroke="url(#g1)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3>Clients</h3>
            <p className="card-number">{stats.totalClients}</p>
            <p className="card-description">Clients inscrits</p>
          </div>

          {/* Livres */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/admin/livres")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M8 8h14a2 2 0 012 2v28a2 2 0 01-2 2H8a2 2 0 01-2-2V10a2 2 0 012-2z"
                  fill="url(#g2)"
                />
                <path
                  d="M24 8h14a2 2 0 012 2v28a2 2 0 01-2 2H24"
                  stroke="url(#g2)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M10 16h10M10 22h10M10 28h6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#f093fb" />
                    <stop offset="100%" stopColor="#f5576c" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3>Livres</h3>
            <p className="card-number">{stats.totalLivres}</p>
            <p className="card-description">Livres disponibles</p>
          </div>

          {/* Commandes */}
          <div
            className="dashboard-card"
            onClick={() => navigate("/admin/orders")}
            style={{ cursor: "pointer" }}
          >
            <div className="card-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M8 36L16 28L24 32L40 16"
                  stroke="url(#g3)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M32 16H40V24"
                  stroke="url(#g3)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="g3" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#43e97b" />
                    <stop offset="100%" stopColor="#38f9d7" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3>Commandes</h3>
            <p className="card-number">{stats.totalOrders}</p>
            <p className="card-description">
              ⏳ {stats.enAttente} en attente · ✅ {stats.confirmes} confirmées
            </p>
          </div>

          {/* Revenus */}
          <div className="dashboard-card">
            <div className="card-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle
                  cx="24"
                  cy="24"
                  r="16"
                  stroke="url(#g4)"
                  strokeWidth="3"
                />
                <path
                  d="M24 16v16M20 20h6a2 2 0 010 4h-4a2 2 0 000 4h6"
                  stroke="url(#g4)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="g4" x1="0" y1="0" x2="48" y2="48">
                    <stop offset="0%" stopColor="#4facfe" />
                    <stop offset="100%" stopColor="#00f2fe" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3>Revenus</h3>
            <p className="card-number">{stats.revenus.toLocaleString()} DT</p>
            <p className="card-description">Commandes confirmées</p>
          </div>
        </div>

        {/* Livres récents + Commandes récentes */}
        <div className="dashboard-bottom">
          {/* Livres récents */}
          <div className="recent-section">
            <div className="recent-header">
              <h3>📚 Livres récents</h3>
              <button
                onClick={() => navigate("/admin/livres")}
                className="see-all-btn"
              >
                Voir tous →
              </button>
            </div>
            <div className="activity-list">
              {stats.livresRecents.length === 0 ? (
                <p style={{ color: "#7b82b0", padding: "1rem" }}>
                  Aucun livre ajouté
                </p>
              ) : (
                stats.livresRecents.map((livre) => (
                  <div key={livre._id} className="activity-item">
                    <div className="activity-icon">📖</div>
                    <div className="activity-content">
                      <span className="activity-text">{livre.titre}</span>
                      <span className="activity-time">
                        par {livre.auteur} · {livre.prix} DT
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        background: "rgba(124,111,247,0.15)",
                        color: "#a78bfa",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                      }}
                    >
                      {livre.categorie}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Commandes récentes */}
          <div className="recent-section">
            <div className="recent-header">
              <h3>📦 Commandes récentes</h3>
              <button
                onClick={() => navigate("/admin/orders")}
                className="see-all-btn"
              >
                Voir toutes →
              </button>
            </div>
            <div className="activity-list">
              {stats.ordersRecents.length === 0 ? (
                <p style={{ color: "#7b82b0", padding: "1rem" }}>
                  Aucune commande
                </p>
              ) : (
                stats.ordersRecents.map((order) => {
                  const statusColors = {
                    "En attente": "#feca57",
                    Confirmé: "#43e97b",
                    Annulé: "#f5576c",
                  };
                  const statusIcons = {
                    "En attente": "⏳",
                    Confirmé: "✅",
                    Annulé: "❌",
                  };
                  return (
                    <div key={order._id} className="activity-item">
                      <div className="activity-icon">
                        {statusIcons[order.status] || "📦"}
                      </div>
                      <div className="activity-content">
                        <span className="activity-text">
                          {order.user?.username || "Client inconnu"}
                        </span>
                        <span className="activity-time">
                          {new Date(order.createdAt).toLocaleDateString(
                            "fr-FR",
                          )}
                          {" · "}
                          {(order.totalPrice || 0).toLocaleString()} DT
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: statusColors[order.status] || "#feca57",
                          fontWeight: "600",
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
