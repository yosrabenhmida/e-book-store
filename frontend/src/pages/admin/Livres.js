import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import "./Livres.css";

const Livres = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState({
    couverture: 0,
    fichierPDF: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

  const initialFormState = {
    titre: "",
    auteur: "",
    categorie: "",
    prix: "",
    description: "",
    resume: "",
    extrait: "",
    couverture: "",
    fichierPDF: "",
  };
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [fileInputs, setFileInputs] = useState({
    couvertureFile: null,
    pdfFile: null,
  });

  // ============================================
  // FONCTIONS DE BASE
  // ============================================

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:3001/api/books");
      setBooks(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des livres:", error);
      setError("Impossible de charger les livres");
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.auteur?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || book.categorie === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================
  // FONCTIONS D'UPLOAD AVEC DÉBOGAGE
  // ============================================

  // Fonction de validation des fichiers
  const validateFile = (file, fileType) => {
    console.log("🔍 Validation du fichier:", file.name);

    if (!file) {
      throw new Error("Aucun fichier sélectionné");
    }

    if (fileType === "couverture") {
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      console.log("   - Type attendu: Image (JPG, PNG, WEBP)");
      console.log("   - Type reçu:", file.type);

      if (!validImageTypes.includes(file.type)) {
        throw new Error(
          `Format d'image non valide. Reçu: ${file.type}. Formats acceptés: JPG, PNG, WEBP`,
        );
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error(
          `L'image est trop volumineuse (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum: 5MB`,
        );
      }

      console.log("   ✓ Validation image réussie");
    } else if (fileType === "pdf") {
      console.log("   - Type attendu: PDF");
      console.log("   - Type reçu:", file.type);

      if (file.type !== "application/pdf") {
        throw new Error(
          `Format invalide. Reçu: ${file.type}. Format attendu: PDF`,
        );
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error(
          `Le PDF est trop volumineux (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum: 50MB`,
        );
      }

      console.log("   ✓ Validation PDF réussie");
    }

    return true;
  };

  // Fonction de test de connexion au serveur
  const testServerConnection = async () => {
    try {
      console.log("🧪 Test de connexion au serveur...");
      const response = await axios.get("http://localhost:3001/api/upload/test");
      console.log("✅ Serveur accessible:", response.data);
      return true;
    } catch (error) {
      console.error("❌ Serveur inaccessible:", error.message);
      setError(
        "Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 3001.",
      );
      return false;
    }
  };

  // Fonction d'upload vers le serveur
  // Fonction d'upload vers le serveur
  const uploadFile = async (file, fileType) => {
    console.log("🚀 === DÉBUT UPLOAD ===");
    console.log("📁 Fichier:", file.name);
    console.log("📊 Taille:", (file.size / 1024).toFixed(2), "KB");
    console.log("🏷️ Type:", file.type);

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    // NE PLUS ENVOYER fileType - le serveur le détectera automatiquement

    console.log("📦 FormData créé");

    try {
      console.log("📤 Envoi de la requête à http://localhost:3001/api/upload");

      const response = await axios.post(
        "http://localhost:3001/api/upload",
        formDataUpload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            console.log(`📊 Progression: ${percentCompleted}%`);
            setUploadProgress((prev) => ({
              ...prev,
              [fileType]: percentCompleted,
            }));
          },
        },
      );

      console.log("✅ === UPLOAD RÉUSSI ===");
      console.log("📋 Réponse:", response.data);
      console.log("🔗 URL:", response.data.fileUrl);
      console.log("========================\n");

      return response.data.fileUrl;
    } catch (error) {
      console.error("❌ === ERREUR UPLOAD ===");
      console.error("Message:", error.message);

      if (error.response) {
        console.error("📋 Réponse du serveur:");
        console.error("   - Status:", error.response.status);
        console.error("   - Data:", error.response.data);
      }
      console.error("========================\n");

      throw new Error(error.response?.data?.message || `Échec de l'upload`);
    }
  };

  // Gestionnaire de changement de fichier
  const handleFileChange = async (e, fileType) => {
    console.log("\n📥 === SÉLECTION DE FICHIER ===");

    const file = e.target.files[0];

    if (!file) {
      console.log("❌ Aucun fichier sélectionné");
      return;
    }

    console.log("📄 Fichier sélectionné:", file.name);

    try {
      // Validation
      validateFile(file, fileType);

      // Stocker le fichier
      setFileInputs((prev) => ({
        ...prev,
        [fileType === "couverture" ? "couvertureFile" : "pdfFile"]: file,
      }));

      console.log("✓ Fichier stocké dans l'état");

      // Prévisualisation pour les images
      if (fileType === "couverture") {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log("✓ Prévisualisation générée");
          setFormData((prev) => ({
            ...prev,
            couverture: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }

      // Réinitialiser l'erreur
      setError("");
      console.log("================================\n");
    } catch (error) {
      console.error("❌ Erreur validation:", error.message);
      setError(error.message);
      e.target.value = ""; // Réinitialiser l'input
    }
  };

  // ============================================
  // GESTION DU FORMULAIRE
  // ============================================

  const handleAddBook = () => {
    setEditingBook(null);
    setFormData(initialFormState);
    setFileInputs({
      couvertureFile: null,
      pdfFile: null,
    });
    setUploadProgress({ couverture: 0, fichierPDF: 0 });
    setShowModal(true);
    setError("");
    setSuccessMessage("");
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      titre: book.titre || "",
      auteur: book.auteur || "",
      categorie: book.categorie || "",
      prix: book.prix || "",
      description: book.description || "",
      resume: book.resume || "",
      extrait: book.extrait || "",
      couverture: book.couverture || "",
      fichierPDF: book.fichierPDF || "",
    });
    setFileInputs({
      couvertureFile: null,
      pdfFile: null,
    });
    setUploadProgress({ couverture: 0, fichierPDF: 0 });
    setShowModal(true);
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsUploading(true);

    console.log("\n🚀 === DÉBUT SOUMISSION FORMULAIRE ===");

    // Validation des champs obligatoires
    if (
      !formData.titre ||
      !formData.auteur ||
      !formData.prix ||
      !formData.categorie
    ) {
      setError("Veuillez remplir tous les champs obligatoires");
      setIsUploading(false);
      return;
    }

    try {
      // Test de connexion au serveur
      const serverOk = await testServerConnection();
      if (!serverOk) {
        setIsUploading(false);
        return;
      }

      let updatedFormData = { ...formData };

      // Upload de la couverture
      if (fileInputs.couvertureFile) {
        console.log("\n📤 Upload de la couverture...");
        try {
          const couvertureUrl = await uploadFile(
            fileInputs.couvertureFile,
            "couverture",
          );
          updatedFormData.couverture = couvertureUrl;
          console.log("✓ Couverture uploadée:", couvertureUrl);
        } catch (error) {
          console.error("❌ Échec upload couverture:", error.message);
          throw new Error(
            `Échec de l'upload de la couverture: ${error.message}`,
          );
        }
      }

      // Upload du PDF
      if (fileInputs.pdfFile) {
        console.log("\n📤 Upload du PDF...");
        try {
          const pdfUrl = await uploadFile(fileInputs.pdfFile, "fichierPDF");
          updatedFormData.fichierPDF = pdfUrl;
          console.log("✓ PDF uploadé:", pdfUrl);
        } catch (error) {
          console.error("❌ Échec upload PDF:", error.message);
          throw new Error(`Échec de l'upload du PDF: ${error.message}`);
        }
      }

      // Sauvegarde du livre
      console.log("\n💾 Sauvegarde du livre...");
      console.log("📋 Données à envoyer:", updatedFormData);
      const url = editingBook
        ? `http://localhost:3001/api/books/${editingBook._id}`
        : "http://localhost:3001/api/books";

      const method = editingBook ? "put" : "post";

      await axios({
        method,
        url,
        data: updatedFormData,
      });

      console.log("✅ Livre sauvegardé avec succès");

      setSuccessMessage(
        editingBook
          ? "Livre modifié avec succès !"
          : "Livre ajouté avec succès !",
      );

      await fetchBooks();

      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage("");
        setFormData(initialFormState);
        setFileInputs({ couvertureFile: null, pdfFile: null });
        setUploadProgress({ couverture: 0, fichierPDF: 0 });
        setEditingBook(null);
        setIsUploading(false);
      }, 1500);

      console.log("================================\n");
    } catch (error) {
      console.error("\n❌ === ERREUR GLOBALE ===");
      console.error(error);
      console.error("========================\n");

      setError(
        error.message ||
          error.response?.data?.message ||
          "Erreur lors de la sauvegarde du livre",
      );
      setIsUploading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) {
      try {
        await axios.delete(`http://localhost:3001/api/books/${id}`);
        setSuccessMessage("Livre supprimé avec succès !");
        await fetchBooks();

        setTimeout(() => {
          setSuccessMessage("");
        }, 2000);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        setError("Erreur lors de la suppression du livre");
      }
    }
  };

  const handleDownloadBook = async (book) => {
    try {
      if (!book.fichierPDF) {
        setError("Aucun fichier PDF disponible pour ce livre");
        return;
      }

      window.open(book.fichierPDF, "_blank");
      setSuccessMessage("Téléchargement démarré !");

      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      setError("Erreur lors du téléchargement du livre");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBook(null);
    setFileInputs({ couvertureFile: null, pdfFile: null });
    setUploadProgress({ couverture: 0, fichierPDF: 0 });
    setError("");
    setSuccessMessage("");
    setIsUploading(false);
  };

  const uniqueBookCategories = [
    ...new Set(books.map((book) => book.categorie).filter(Boolean)),
  ];

  // ============================================
  // RENDU JSX
  // ============================================

  return (
    <div className="livres-container">
      <Navbar />

      <div className="livres-content">
        {/* Messages */}
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
            <button onClick={() => setError("")} className="alert-close">
              ×
            </button>
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

        {/* Header */}
        <div className="livres-header">
          <div className="header-left">
            <h1 className="page-title">
              <span className="title-icon">📚</span>
              Gestion des Livres
            </h1>
            <p className="page-subtitle">
              {filteredBooks.length} livre{filteredBooks.length > 1 ? "s" : ""}{" "}
              disponible{filteredBooks.length > 1 ? "s" : ""}
            </p>
          </div>
          <button className="btn-add-book" onClick={handleAddBook}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 4V16M4 10H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Ajouter un livre
          </button>
        </div>

        {/* Filters & Search */}
        <div className="controls-section">
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par titre ou auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <div className="category-filters">
              <button
                className={`filter-btn ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                Tous
              </button>
              {uniqueBookCategories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="view-toggle">
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
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="Vue liste"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2 5h16M2 10h16M2 15h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Books Grid/List */}
        {isLoading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Chargement des livres...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h3>Aucun livre trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div className={`books-${viewMode}`}>
            {filteredBooks.map((book, index) => (
              <div
                key={book._id}
                className="book-card"
                style={{ "--card-index": index }}
              >
                <div className="book-image-container">
                  <img
                    src={
                      book.couverture ||
                      "https://via.placeholder.com/400x600?text=Pas+d'image"
                    }
                    alt={book.titre}
                    className="book-image"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x600?text=Pas+d'image";
                    }}
                  />
                  <div className="book-overlay">
                    <button
                      className="overlay-btn"
                      onClick={() => handleEditBook(book)}
                      aria-label="Éditer"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M14.5 2.5a2.121 2.121 0 0 1 3 3L6 17l-4 1 1-4L14.5 2.5z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {book.fichierPDF && (
                      <button
                        className="overlay-btn download"
                        onClick={() => handleDownloadBook(book)}
                        aria-label="Télécharger"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M17 13v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M10 2v12m0 0l-4-4m4 4l4-4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                    <button
                      className="overlay-btn delete"
                      onClick={() => handleDeleteBook(book._id)}
                      aria-label="Supprimer"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M2.5 5h15M8 9v6M12 9v6M7 5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 5v11a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5H6z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="book-info">
                  <h3 className="book-title">{book.titre}</h3>
                  <p className="book-author">par {book.auteur}</p>

                  <div className="book-meta">
                    <span className="book-category">{book.categorie}</span>
                    {book.fichierPDF && (
                      <span className="pdf-badge">📄 PDF</span>
                    )}
                  </div>

                  <div className="book-footer">
                    <span className="book-price">{book.prix} DT</span>
                    <button
                      className="btn-view-details"
                      onClick={() => navigate(`/admin/livres/${book._id}`)}
                    >
                      Détails
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M6 12l4-4-4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBook ? "Modifier le livre" : "Ajouter un livre"}</h2>
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
                  <label>Titre *</label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    placeholder="Titre du livre"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Auteur *</label>
                  <input
                    type="text"
                    name="auteur"
                    value={formData.auteur}
                    onChange={handleInputChange}
                    placeholder="Nom de l'auteur"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.875rem 1rem",
                      border: "2px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "1rem",
                      backgroundColor: "white",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Prix (DT) *</label>
                  <input
                    type="number"
                    name="prix"
                    value={formData.prix}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description du livre..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Résumé (pour les visiteurs) 📖</label>
                <textarea
                  name="resume"
                  value={formData.resume}
                  onChange={handleInputChange}
                  placeholder="Résumé complet du livre que les visiteurs pourront lire..."
                  rows="5"
                />
                <small
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    marginTop: "0.5rem",
                    display: "block",
                  }}
                >
                  ✨ Ce résumé sera visible publiquement sur le catalogue
                </small>
              </div>

              <div className="form-group">
                <label>Extrait</label>
                <textarea
                  name="extrait"
                  value={formData.extrait}
                  onChange={handleInputChange}
                  placeholder="Extrait du livre..."
                  rows="3"
                />
              </div>

              {/* Section Image de couverture avec upload */}
              <div className="form-group">
                <label>Image de couverture 🖼️</label>

                {/* Option 1: Upload de fichier */}
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    htmlFor="couverture-upload"
                    style={{
                      display: "inline-block",
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#2563eb";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#3b82f6";
                    }}
                  >
                    📤 Choisir un fichier image
                  </label>
                  <input
                    id="couverture-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e, "couverture")}
                    style={{ display: "none" }}
                  />
                  {fileInputs.couvertureFile && (
                    <span style={{ marginLeft: "1rem", color: "#10b981" }}>
                      ✓ {fileInputs.couvertureFile.name}
                    </span>
                  )}
                </div>

                {/* Barre de progression pour l'upload */}
                {uploadProgress.couverture > 0 &&
                  uploadProgress.couverture < 100 && (
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        backgroundColor: "#e5e7eb",
                        borderRadius: "4px",
                        overflow: "hidden",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: `${uploadProgress.couverture}%`,
                          height: "100%",
                          backgroundColor: "#3b82f6",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  )}

                {/* Option 2: URL */}
                <div style={{ marginTop: "0.5rem" }}>
                  <small
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#6b7280",
                    }}
                  >
                    Ou entrez une URL d'image:
                  </small>
                  <input
                    type="url"
                    name="couverture"
                    value={formData.couverture}
                    onChange={handleInputChange}
                    placeholder="https://exemple.com/couverture.jpg"
                    disabled={!!fileInputs.couvertureFile}
                    style={{
                      opacity: fileInputs.couvertureFile ? 0.5 : 1,
                    }}
                  />
                </div>

                {/* Prévisualisation de l'image */}
                {formData.couverture && (
                  <div
                    style={{
                      marginTop: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={formData.couverture}
                      alt="Prévisualisation"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "300px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Section PDF avec upload */}
              <div className="form-group">
                <label>Fichier PDF du livre 📄</label>

                {/* Option 1: Upload de fichier */}
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    htmlFor="pdf-upload"
                    style={{
                      display: "inline-block",
                      padding: "0.75rem 1.5rem",
                      backgroundColor: "#ef4444",
                      color: "white",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#ef4444";
                    }}
                  >
                    📤 Choisir un fichier PDF
                  </label>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(e, "pdf")}
                    style={{ display: "none" }}
                  />
                  {fileInputs.pdfFile && (
                    <span style={{ marginLeft: "1rem", color: "#10b981" }}>
                      ✓ {fileInputs.pdfFile.name}
                    </span>
                  )}
                </div>

                {/* Barre de progression pour l'upload */}
                {uploadProgress.fichierPDF > 0 &&
                  uploadProgress.fichierPDF < 100 && (
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        backgroundColor: "#e5e7eb",
                        borderRadius: "4px",
                        overflow: "hidden",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: `${uploadProgress.fichierPDF}%`,
                          height: "100%",
                          backgroundColor: "#ef4444",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  )}

                {/* Option 2: URL */}
                <div style={{ marginTop: "0.5rem" }}>
                  <small
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "#6b7280",
                    }}
                  >
                    Ou entrez une URL du PDF:
                  </small>
                  <input
                    type="url"
                    name="fichierPDF"
                    value={formData.fichierPDF}
                    onChange={handleInputChange}
                    placeholder="https://exemple.com/livre.pdf"
                    disabled={!!fileInputs.pdfFile}
                    style={{
                      opacity: fileInputs.pdfFile ? 0.5 : 1,
                    }}
                  />
                </div>
              </div>

              {error && <div className="form-error">{error}</div>}
              {successMessage && (
                <div className="form-success">{successMessage}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                  disabled={isUploading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isUploading}
                  style={{
                    opacity: isUploading ? 0.6 : 1,
                    cursor: isUploading ? "not-allowed" : "pointer",
                  }}
                >
                  {isUploading
                    ? "Envoi en cours..."
                    : editingBook
                      ? "Modifier"
                      : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Livres;
