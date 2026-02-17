import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./../../components/layout/Navbar";
import "./Clients.css";

const API = "http://localhost:3001/api/users";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

const initialForm = {
  username: "",
  email: "",
  password: "",
  phone: "",
  avatar: "",
  totalOrders: 0,
  totalSpent: 0,
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const COLORS = [
  "#667eea",
  "#f97316",
  "#22c55e",
  "#3b82f6",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
];
const getColor = (name = "") => COLORS[name.charCodeAt(0) % COLORS.length];

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("username");
  const [viewMode, setViewMode] = useState("table");
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Fetch ──────────────────────────────────────────────
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/clients`, getAuthHeader());
      setClients(res.data);
    } catch {
      setError("Impossible de charger les clients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // ── Filtres ────────────────────────────────────────────
  const filtered = clients
    .filter((c) => {
      const q = searchTerm.toLowerCase();
      return (
        c.username?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "username")
        return (a.username || "").localeCompare(b.username || "");
      if (sortBy === "totalOrders")
        return (b.totalOrders || 0) - (a.totalOrders || 0);
      if (sortBy === "totalSpent")
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (sortBy === "joinDate")
        return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  // ── Stats ──────────────────────────────────────────────
  const stats = {
    total: clients.length,
    thisMonth: clients.filter((c) => {
      const d = new Date(c.createdAt),
        now = new Date();
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length,
    totalRevenue: clients.reduce((s, c) => s + (c.totalSpent || 0), 0),
    totalOrders: clients.reduce((s, c) => s + (c.totalOrders || 0), 0),
  };

  // ── Modal ──────────────────────────────────────────────
  const openAdd = () => {
    setEditingClient(null);
    setFormData(initialForm);
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setFormData({
      username: client.username || "",
      email: client.email || "",
      password: "",
      phone: client.phone || "",
      avatar: client.avatar || "",
      totalOrders: client.totalOrders || 0,
      totalSpent: client.totalSpent || 0,
    });
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData(initialForm);
    setFormError("");
    setFormSuccess("");
    setIsSubmitting(false);
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Submit ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setIsSubmitting(true);
    try {
      if (editingClient) {
        const payload = {
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          avatar: formData.avatar,
          totalOrders: Number(formData.totalOrders),
          totalSpent: Number(formData.totalSpent),
        };
        if (formData.password) payload.password = formData.password;
        await axios.put(
          `${API}/clients/${editingClient._id}`,
          payload,
          getAuthHeader(),
        );
        setFormSuccess("Client modifié avec succès !");
      } else {
        if (!formData.password)
          return setFormError("Le mot de passe est obligatoire");
        await axios.post(
          `${API}/clients`,
          {
            ...formData,
            totalOrders: Number(formData.totalOrders),
            totalSpent: Number(formData.totalSpent),
          },
          getAuthHeader(),
        );
        setFormSuccess("Client créé avec succès !");
      }
      await fetchClients();
      setTimeout(closeModal, 1200);
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Erreur lors de la sauvegarde",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce client définitivement ?")) return;
    try {
      await axios.delete(`${API}/${id}`, getAuthHeader());
      setSuccessMsg("Client supprimé !");
      await fetchClients();
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="clients-container">
      <Navbar />

      <div className="clients-content">
        {/* Alerts */}
        {error && (
          <div className="message-alert error-alert">
            ⚠️ {error}
            <button onClick={() => setError("")} className="alert-close">
              ×
            </button>
          </div>
        )}
        {successMsg && (
          <div className="message-alert success-alert">✅ {successMsg}</div>
        )}

        {/* Header */}
        <div className="clients-header">
          <div className="header-left">
            <h1 className="page-title">
              <span className="title-icon">👥</span>Gestion des Clients
            </h1>
            <p className="page-subtitle">
              {filtered.length} client{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
          <button className="btn-add-client" onClick={openAdd}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Nouveau client
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M13 7a4 4 0 11-8 0 4 4 0 018 0zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="stat-details">
              <p className="stat-label">Total Clients</p>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ background: "linear-gradient(135deg,#43e97b,#38f9d7)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 11.08V12a10 10 0 11-5.93-9.14"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M22 4L12 14.01l-3-3"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="stat-details">
              <p className="stat-label">Nouveaux ce mois</p>
              <p className="stat-value">+{stats.thisMonth}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ background: "linear-gradient(135deg,#f093fb,#f5576c)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="stat-details">
              <p className="stat-label">Total Commandes</p>
              <p className="stat-value">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ background: "linear-gradient(135deg,#4facfe,#00f2fe)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="stat-details">
              <p className="stat-label">Revenus Total</p>
              <p className="stat-value">
                {stats.totalRevenue.toLocaleString()} DT
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M9 17A8 8 0 109 1a8 8 0 000 16zM19 19l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="username">Nom (A-Z)</option>
              <option value="totalOrders">Commandes</option>
              <option value="totalSpent">Dépenses</option>
              <option value="joinDate">Plus récent</option>
            </select>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
                aria-label="Vue tableau"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 3h14v14H3V3zM3 8h14M8 3v14"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Vue grille"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <rect
                    x="11"
                    y="2"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <rect
                    x="2"
                    y="11"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <rect
                    x="11"
                    y="11"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Chargement des clients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>Aucun client trouvé</h3>
            <p>
              {searchTerm
                ? "Modifiez votre recherche"
                : "Ajoutez votre premier client !"}
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* ── TABLE ── */
          <div className="clients-table-wrapper">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Commandes</th>
                  <th>Dépenses</th>
                  <th>Inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client, index) => (
                  <tr key={client._id} style={{ "--row-index": index }}>
                    <td>
                      <div className="client-info">
                        {client.avatar ? (
                          <img
                            src={client.avatar}
                            alt={client.username}
                            className="client-avatar"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="client-avatar"
                            style={{
                              background: getColor(client.username),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "700",
                              fontSize: "0.85rem",
                            }}
                          >
                            {getInitials(client.username)}
                          </div>
                        )}
                        <div className="client-name-wrapper">
                          <p className="client-name">{client.username}</p>
                          <p className="client-id">
                            ID: #{client._id.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <p className="client-email">{client.email}</p>
                        <p className="client-phone">{client.phone || "—"}</p>
                      </div>
                    </td>
                    <td>
                      <span className="table-value">
                        {client.totalOrders || 0}
                      </span>
                    </td>
                    <td>
                      <span className="table-value amount">
                        {(client.totalSpent || 0).toLocaleString()} DT
                      </span>
                    </td>
                    <td>
                      <span className="table-value date">
                        {client.createdAt
                          ? new Date(client.createdAt).toLocaleDateString(
                              "fr-FR",
                            )
                          : "—"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => openEdit(client)}
                          aria-label="Éditer"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M13 2a2.121 2.121 0 013 3L5 16l-4 1 1-4L13 2z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(client._id)}
                          aria-label="Supprimer"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M2 4h14M6 4V3a1 1 0 011-1h4a1 1 0 011 1v1M5 4v10a2 2 0 002 2h4a2 2 0 002-2V4H5z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── GRID ── */
          <div className="clients-grid">
            {filtered.map((client, index) => (
              <div
                key={client._id}
                className="client-card"
                style={{ "--card-index": index }}
              >
                <div className="card-header">
                  {client.avatar ? (
                    <img
                      src={client.avatar}
                      alt={client.username}
                      className="card-avatar"
                    />
                  ) : (
                    <div
                      className="card-avatar"
                      style={{
                        background: getColor(client.username),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "700",
                        fontSize: "1.3rem",
                      }}
                    >
                      {getInitials(client.username)}
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <h3 className="card-name">{client.username}</h3>
                  <p className="card-email">{client.email}</p>
                  <p className="card-phone">{client.phone || "—"}</p>
                  <div className="card-stats">
                    <div className="card-stat">
                      <span className="stat-number">
                        {client.totalOrders || 0}
                      </span>
                      <span className="stat-text">Commandes</span>
                    </div>
                    <div className="card-stat">
                      <span className="stat-number">
                        {(client.totalSpent || 0).toLocaleString()} DT
                      </span>
                      <span className="stat-text">Dépensé</span>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    className="card-btn edit"
                    onClick={() => openEdit(client)}
                  >
                    Éditer
                  </button>
                  <button
                    className="card-btn delete"
                    onClick={() => handleDelete(client._id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingClient ? "✏️ Modifier le client" : "➕ Nouveau client"}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nom d'utilisateur *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInput}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInput}
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInput}
                  placeholder="jean@exemple.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  {editingClient
                    ? "Nouveau mot de passe (laisser vide pour ne pas changer)"
                    : "Mot de passe *"}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInput}
                  placeholder="Min. 6 caractères"
                  required={!editingClient}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>URL Avatar (optionnel)</label>
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInput}
                  placeholder="https://..."
                />
              </div>

              {editingClient && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Nb. Commandes</label>
                    <input
                      type="number"
                      name="totalOrders"
                      value={formData.totalOrders}
                      onChange={handleInput}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Dépensé (DT)</label>
                    <input
                      type="number"
                      name="totalSpent"
                      value={formData.totalSpent}
                      onChange={handleInput}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {formError && <div className="form-error">⚠️ {formError}</div>}
              {formSuccess && (
                <div className="form-success">✅ {formSuccess}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Envoi..."
                    : editingClient
                      ? "Modifier"
                      : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
