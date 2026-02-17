import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./../../components/layout/Navbar";
import "./Categoeries.css";

// Liste des icônes disponibles
const iconOptions = ["💻", "🚀", "🌐", "📊", "🧮", "🗄️", "🔒", "🤖"];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: iconOptions[0],
    color: "#667eea",
    bookCount: 0,
    totalSales: 0,
    trending: false,
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const API_URL = "http://localhost:3001/api/categories";

  // Fetch categories depuis le backend
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      setCategories(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les catégories");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Afficher un message de succès temporaire
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Ouvrir le modal pour ajouter
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      description: "",
      icon: iconOptions[0],
      color: "#667eea",
      bookCount: 0,
      totalSales: 0,
      trending: false,
    });
    setShowModal(true);
  };

  // Ouvrir le modal pour éditer
  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || iconOptions[0],
      color: category.color || "#667eea",
      bookCount: category.bookCount || 0,
      totalSales: category.totalSales || 0,
      trending: category.trending || false,
    });
    setShowModal(true);
  };

  // Ajouter ou modifier une catégorie
  const handleSaveCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        setError("Le nom de la catégorie est requis");
        return;
      }

      if (editingCategory) {
        // Mode édition
        const response = await axios.put(
          `${API_URL}/${editingCategory._id}`,
          categoryForm,
        );
        setCategories(
          categories.map((cat) =>
            cat._id === editingCategory._id ? response.data : cat,
          ),
        );
        showSuccess("Catégorie modifiée avec succès");
      } else {
        // Mode ajout
        const response = await axios.post(API_URL, categoryForm);
        setCategories([...categories, response.data]);
        showSuccess("Catégorie ajoutée avec succès");
      }

      setShowModal(false);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        editingCategory
          ? "Impossible de modifier la catégorie"
          : "Impossible d'ajouter la catégorie",
      );
    }
  };

  // Supprimer une catégorie
  const handleDeleteCategory = async (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")
    ) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setCategories(categories.filter((cat) => cat._id !== id));
        showSuccess("Catégorie supprimée avec succès");
      } catch (err) {
        console.error(err);
        setError("Impossible de supprimer cette catégorie.");
      }
    }
  };

  // Filtrage et tri
  const filteredCategories = categories
    .filter((cat) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "bookCount") return b.bookCount - a.bookCount;
      if (sortBy === "totalSales") return b.totalSales - a.totalSales;
      return 0;
    });

  return (
    <div className="categories-container">
      <Navbar />

      <div className="categories-content">
        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {/* Header */}
        <div className="categories-header">
          <h1>Gestion des Catégories</h1>
          <button onClick={handleOpenAddModal}>➕ Nouvelle Catégorie</button>
        </div>

        {/* Controls */}
        <div className="controls-section">
          <input
            type="text"
            placeholder="🔍 Rechercher une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">📝 Trier par Nom</option>
            <option value="bookCount">📚 Trier par Livres</option>
            <option value="totalSales">💰 Trier par Revenus</option>
          </select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement des catégories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <p>🔍 Aucune catégorie trouvée</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          <div className="categories-grid">
            {filteredCategories.map((cat) => (
              <div
                key={cat._id}
                className="category-card"
                style={{
                  borderLeft: `5px solid ${cat.color || "#667eea"}`,
                }}
              >
                <div className="category-card-header">
                  <h3>
                    <span className="category-icon">{cat.icon || "📁"}</span>
                    {cat.name}
                  </h3>
                  {cat.trending && (
                    <span className="trending-badge">🔥 Trending</span>
                  )}
                </div>

                {cat.description && (
                  <p className="category-description">{cat.description}</p>
                )}

                <div className="category-stats">
                  <div className="stat-item">
                    <span className="stat-label">📚 Livres</span>
                    <span className="stat-value">{cat.bookCount || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">💰 Revenus</span>
                    <span className="stat-value">
                      {(cat.totalSales || 0).toLocaleString()}€
                    </span>
                  </div>
                </div>

                <div className="category-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleOpenEditModal(cat)}
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteCategory(cat._id)}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>
                {editingCategory
                  ? "✏️ Modifier la Catégorie"
                  : "➕ Ajouter une Catégorie"}
              </h2>

              <div className="form-group">
                <label>Nom de la catégorie *</label>
                <input
                  type="text"
                  placeholder="Ex: Science-Fiction"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Choisir une icône</label>
                <div className="icon-options">
                  {iconOptions.map((icon) => (
                    <span
                      key={icon}
                      className={`icon-option ${
                        categoryForm.icon === icon ? "selected" : ""
                      }`}
                      onClick={() => setCategoryForm({ ...categoryForm, icon })}
                    >
                      {icon}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={categoryForm.trending}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        trending: e.target.checked,
                      })
                    }
                  />
                  <span>🔥 Marquer comme Trending</span>
                </label>
              </div>

              <div className="modal-actions">
                <button className="btn-primary" onClick={handleSaveCategory}>
                  {editingCategory ? "💾 Enregistrer" : "➕ Ajouter"}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  ❌ Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
