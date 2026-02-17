import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./../../components/layout/Navbar";
import "./Orders.css";

const API = "http://localhost:3001/api/orders";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

const STATUS_CONFIG = {
  "En attente": { label: "En attente", icon: "⏳", class: "status-pending" },
  Confirmé: { label: "Confirmé", icon: "✅", class: "status-delivered" },
  Annulé: { label: "Annulé", icon: "❌", class: "status-cancelled" },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Fetch ──────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(API, getAuthHeader());
      setOrders(res.data);
    } catch {
      setError("Impossible de charger les commandes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── Filtres ────────────────────────────────────────────
  const filtered = orders
    .filter((o) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        o._id?.toLowerCase().includes(q) ||
        o.user?.username?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || o.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "total") return (b.totalPrice || 0) - (a.totalPrice || 0);
      return 0;
    });

  // ── Stats ──────────────────────────────────────────────
  const stats = {
    total: orders.length,
    enAttente: orders.filter((o) => o.status === "En attente").length,
    confirme: orders.filter((o) => o.status === "Confirmé").length,
    annule: orders.filter((o) => o.status === "Annulé").length,
    totalRevenue: orders
      .filter((o) => o.status === "Confirmé")
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  // ── Update status ──────────────────────────────────────
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/${orderId}`,
        { status: newStatus },
        getAuthHeader(),
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      setSuccessMsg("Statut mis à jour !");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch {
      setError("Erreur lors de la mise à jour du statut");
    }
  };

  // ── Delete ─────────────────────────────────────────────
  const handleDelete = async (orderId) => {
    if (!window.confirm("Supprimer cette commande définitivement ?")) return;
    try {
      await axios.delete(`${API}/${orderId}`, getAuthHeader());
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      if (selectedOrder?._id === orderId) setSelectedOrder(null);
      setSuccessMsg("Commande supprimée !");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch {
      setError("Erreur lors de la suppression");
    }
  };

  const getStatus = (status) =>
    STATUS_CONFIG[status] || {
      label: status,
      icon: "📦",
      class: "status-pending",
    };

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="orders-container">
      <Navbar />

      <div className="orders-content">
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
        <div className="orders-header">
          <div className="header-left">
            <h1 className="page-title">
              <span className="title-icon">📦</span>Gestion des Commandes
            </h1>
            <p className="page-subtitle">
              {filtered.length} commande{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
          <button className="btn-export" onClick={fetchOrders}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4v12M4 10l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Actualiser
          </button>
        </div>

        {/* Stats — 4 cartes seulement */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">📊</span>
              <span className="stat-label">Total</span>
            </div>
            <p className="stat-value">{stats.total}</p>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">⏳</span>
              <span className="stat-label">En attente</span>
            </div>
            <p className="stat-value">{stats.enAttente}</p>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">✅</span>
              <span className="stat-label">Confirmées</span>
            </div>
            <p className="stat-value">{stats.confirme}</p>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-icon">❌</span>
              <span className="stat-label">Annulées</span>
            </div>
            <p className="stat-value">{stats.annule}</p>
          </div>
          <div className="stat-card highlight">
            <div className="stat-header">
              <span className="stat-icon">💰</span>
              <span className="stat-label">Revenus</span>
            </div>
            <p className="stat-value">
              {stats.totalRevenue.toLocaleString()} DT
            </p>
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
              placeholder="Rechercher par ID, nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Confirmé">Confirmées</option>
              <option value="Annulé">Annulées</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Date (récent)</option>
              <option value="total">Montant</option>
            </select>
          </div>
        </div>

        {/* Orders Layout */}
        <div className="orders-layout">
          <div className="orders-list">
            {isLoading ? (
              <div className="loading-container">
                <div className="loader"></div>
                <p>Chargement des commandes...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>Aucune commande trouvée</h3>
                <p>
                  {searchTerm
                    ? "Modifiez vos critères"
                    : "Aucune commande pour le moment"}
                </p>
              </div>
            ) : (
              filtered.map((order, index) => (
                <div
                  key={order._id}
                  className={`order-card ${selectedOrder?._id === order._id ? "selected" : ""}`}
                  style={{ "--card-index": index }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="order-card-header">
                    <div className="order-id-wrapper">
                      <span className="order-id">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <span
                      className={`status-badge ${getStatus(order.status).class}`}
                    >
                      <span className="status-icon">
                        {getStatus(order.status).icon}
                      </span>
                      {getStatus(order.status).label}
                    </span>
                  </div>
                  <div className="order-card-body">
                    <div className="customer-info">
                      <p className="customer-name">
                        {order.user?.username || "Client inconnu"}
                      </p>
                      <p className="customer-email">
                        {order.user?.email || "—"}
                      </p>
                    </div>
                    <div className="order-summary">
                      <span className="items-count">
                        {order.books?.length || 0} livre
                        {order.books?.length > 1 ? "s" : ""}
                      </span>
                      <span className="order-total">
                        {(order.totalPrice || 0).toLocaleString()} DT
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail Panel */}
          {selectedOrder && (
            <div className="order-details-panel">
              <div className="panel-header">
                <h2>Détails de la commande</h2>
                <button
                  className="btn-close"
                  onClick={() => setSelectedOrder(null)}
                >
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

              <div className="panel-content">
                {/* Infos générales */}
                <div className="detail-section">
                  <h3>Informations générales</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Numéro</span>
                      <span className="detail-value">
                        #{selectedOrder._id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Date</span>
                      <span className="detail-value">
                        {new Date(selectedOrder.createdAt).toLocaleDateString(
                          "fr-FR",
                        )}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Statut</span>
                      <select
                        className="status-select"
                        value={selectedOrder.status}
                        onChange={(e) =>
                          handleUpdateStatus(selectedOrder._id, e.target.value)
                        }
                      >
                        <option value="En attente">⏳ En attente</option>
                        <option value="Confirmé">✅ Confirmé</option>
                        <option value="Annulé">❌ Annulé</option>
                      </select>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Total</span>
                      <span
                        className="detail-value"
                        style={{ color: "#43e97b", fontWeight: "700" }}
                      >
                        {(selectedOrder.totalPrice || 0).toLocaleString()} DT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client */}
                <div className="detail-section">
                  <h3>Client</h3>
                  <div className="customer-details">
                    <p className="detail-value">
                      {selectedOrder.user?.username || "Client inconnu"}
                    </p>
                    <p className="detail-secondary">
                      {selectedOrder.user?.email || "—"}
                    </p>
                    <p className="detail-secondary">
                      {selectedOrder.user?.phone || "—"}
                    </p>
                  </div>
                </div>

                {/* Livres */}
                <div className="detail-section">
                  <h3>Livres commandés</h3>
                  <div className="items-list">
                    {selectedOrder.books?.map((item, i) => (
                      <div key={i} className="item-row">
                        <div className="item-info">
                          <p className="item-title">
                            {item.book?.titre || "Livre supprimé"}
                          </p>
                          <p className="item-qty">Quantité : {item.quantity}</p>
                        </div>
                        <p className="item-price">
                          {item.book?.prix
                            ? (
                                item.book.prix * item.quantity
                              ).toLocaleString() + " DT"
                            : "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="total-row">
                    <span>Total</span>
                    <span className="total-amount">
                      {(selectedOrder.totalPrice || 0).toLocaleString()} DT
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="panel-actions">
                  <button
                    className="btn-action delete"
                    onClick={() => handleDelete(selectedOrder._id)}
                  >
                    Supprimer la commande
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
