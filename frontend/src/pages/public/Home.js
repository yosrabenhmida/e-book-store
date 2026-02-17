import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Home.css";

const API = "http://localhost:3001/api";

const Home = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes] = await Promise.all([axios.get(`${API}/books`)]);
        setBooks(booksRes.data);
      } catch (err) {
        console.error("Erreur chargement:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = books.filter((b) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      b.titre?.toLowerCase().includes(q) ||
      b.auteur?.toLowerCase().includes(q) ||
      b.resume?.toLowerCase().includes(q);
    const matchCat = selectedCat === "all" || b.categorie === selectedCat;
    return matchSearch && matchCat;
  });

  const uniqueCats = [
    ...new Set(books.map((b) => b.categorie).filter(Boolean)),
  ];

  return (
    <div className="home-page">
      {/* ── NAVBAR ── */}
      <nav className="home-nav">
        <div className="home-nav-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-name">E-Book Store</span>
        </div>
        <div className="home-nav-actions">
          <button
            className="nav-btn-outline"
            onClick={() => navigate("/login")}
          >
            Se connecter
          </button>
          <button
            className="nav-btn-fill"
            onClick={() => navigate("/register")}
          >
            S'inscrire
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="hero-bg-orb orb1" />
        <div className="hero-bg-orb orb2" />
        <div className="hero-bg-orb orb3" />
        <div className="hero-content">
          <span className="hero-tag">📖 Bibliothèque numérique</span>
          <h1 className="hero-title">
            Découvrez des milliers
            <br />
            <span className="hero-accent">de livres numériques</span>
          </h1>
          <p className="hero-subtitle">
            Accédez instantanément à votre lecture. Achetez, lisez et
            téléchargez vos livres préférés en PDF.
          </p>
          <div className="hero-actions">
            <button
              className="hero-btn-main"
              onClick={() => navigate("/register")}
            >
              Créer un compte gratuit →
            </button>
            <button
              className="hero-btn-ghost"
              onClick={() => {
                document
                  .getElementById("catalogue")
                  .scrollIntoView({ behavior: "smooth" });
              }}
            >
              Voir le catalogue
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-n">{books.length}+</span>
              <span className="hero-stat-l">Livres</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-n">{uniqueCats.length}</span>
              <span className="hero-stat-l">Catégories</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <span className="hero-stat-n">PDF</span>
              <span className="hero-stat-l">Instantané</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATALOGUE ── */}
      <section className="home-catalogue" id="catalogue">
        <div className="catalogue-header">
          <h2 className="catalogue-title">Notre Catalogue</h2>
          <p className="catalogue-sub">
            {filtered.length} livre{filtered.length > 1 ? "s" : ""} disponible
            {filtered.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div className="catalogue-controls">
          <div className="home-search">
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
              placeholder="Rechercher un livre, un auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="cat-filters">
            <button
              className={`cat-btn ${selectedCat === "all" ? "active" : ""}`}
              onClick={() => setSelectedCat("all")}
            >
              Tous
            </button>
            {uniqueCats.map((cat) => (
              <button
                key={cat}
                className={`cat-btn ${selectedCat === cat ? "active" : ""}`}
                onClick={() => setSelectedCat(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="home-loading">
            <div className="home-spinner" />
            <p>Chargement des livres...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="home-empty">
            <span>📭</span>
            <p>Aucun livre trouvé</p>
          </div>
        ) : (
          <div className="home-books-grid">
            {filtered.map((book, i) => (
              <div
                key={book._id}
                className="home-book-card"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setSelectedBook(book)}
              >
                <div className="home-book-cover">
                  <img
                    src={
                      book.couverture ||
                      "https://via.placeholder.com/300x400?text=📖"
                    }
                    alt={book.titre}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x400?text=📖";
                    }}
                  />
                  <div className="home-book-overlay">
                    <button className="overlay-see-more">Voir détails</button>
                  </div>
                </div>
                <div className="home-book-info">
                  <span className="home-book-cat">{book.categorie}</span>
                  <h3 className="home-book-title">{book.titre}</h3>
                  <p className="home-book-author">par {book.auteur}</p>
                  <div className="home-book-footer">
                    <span className="home-book-price">{book.prix} DT</span>
                    {book.fichierPDF && (
                      <span className="home-pdf-badge">📄 PDF</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA SECTION ── */}
      <section className="home-cta">
        <div className="cta-content">
          <h2>Prêt à commencer votre lecture ?</h2>
          <p>
            Créez votre compte gratuitement et accédez à tous nos livres
            numériques.
          </p>
          <div className="cta-actions">
            <button
              className="hero-btn-main"
              onClick={() => navigate("/register")}
            >
              S'inscrire maintenant
            </button>
            <button
              className="nav-btn-outline"
              onClick={() => navigate("/login")}
            >
              J'ai déjà un compte
            </button>
          </div>
        </div>
      </section>

      {/* ── MODAL DÉTAIL LIVRE ── */}
      {selectedBook && (
        <div
          className="home-modal-overlay"
          onClick={() => setSelectedBook(null)}
        >
          <div className="home-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="home-modal-close"
              onClick={() => setSelectedBook(null)}
            >
              ×
            </button>
            <div className="home-modal-body">
              <img
                src={
                  selectedBook.couverture ||
                  "https://via.placeholder.com/300x400?text=📖"
                }
                alt={selectedBook.titre}
                className="home-modal-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x400?text=📖";
                }}
              />
              <div className="home-modal-info">
                <span className="home-book-cat">{selectedBook.categorie}</span>
                <h2>{selectedBook.titre}</h2>
                <p className="home-book-author">par {selectedBook.auteur}</p>
                <p className="home-modal-resume">
                  {selectedBook.resume ||
                    selectedBook.description ||
                    "Aucun résumé disponible."}
                </p>
                <div className="home-modal-footer">
                  <span className="home-book-price">
                    {selectedBook.prix} DT
                  </span>
                  <button
                    className="hero-btn-main"
                    onClick={() => navigate("/register")}
                  >
                    S'inscrire pour acheter →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <span>© 2025 E-Book Store · Tous droits réservés</span>
      </footer>
    </div>
  );
};

export default Home;
