import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./BookDetail.css";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("resume");
  const [pdfLoading, setPdfLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:3001/api/books/${id}`,
        );
        setBook(response.data);
      } catch (err) {
        setError("Impossible de charger les détails du livre");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bd-loading">
        <div className="bd-spinner" />
        <p>Chargement du livre...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="bd-error">
        <span>📚</span>
        <p>{error || "Livre introuvable"}</p>
        <button onClick={() => navigate(-1)}>← Retour</button>
      </div>
    );
  }

  return (
    <div className="bd-page">
      {/* Ambient background glow from cover */}
      <div
        className="bd-ambient"
        style={{
          backgroundImage: book.couverture ? `url(${book.couverture})` : "none",
        }}
      />

      {/* Top bar */}
      <div className="bd-topbar">
        <button className="bd-back" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 4L6 10l6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Retour aux livres
        </button>
        <span className="bd-badge-admin">👑 Vue Admin</span>
      </div>

      <div className="bd-container">
        {/* LEFT — Cover */}
        <aside className="bd-sidebar">
          <div className="bd-cover-wrap">
            <img
              src={
                book.couverture ||
                "https://via.placeholder.com/400x600?text=Pas+d%27image"
              }
              alt={book.titre}
              className="bd-cover"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/400x600?text=Pas+d%27image";
              }}
            />
            <div className="bd-cover-shine" />
          </div>

          {/* Price card */}
          <div className="bd-price-card">
            <div className="bd-price-label">Prix</div>
            <div className="bd-price-value">{book.prix} DT</div>
            {book.fichierPDF && (
              <a
                href={book.fichierPDF}
                target="_blank"
                rel="noreferrer"
                className="bd-btn-download"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M17 13v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M10 2v12m0 0l-4-4m4 4l4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Télécharger PDF
              </a>
            )}
            <button
              className="bd-btn-edit"
              onClick={() => navigate(`/admin/livres`)}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M14.5 2.5a2.121 2.121 0 013 3L6 17l-4 1 1-4L14.5 2.5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Modifier le livre
            </button>
          </div>
        </aside>

        {/* RIGHT — Content */}
        <main className="bd-main">
          {/* Header info */}
          <div className="bd-header">
            <div className="bd-meta-top">
              <span className="bd-category">{book.categorie}</span>
              {book.fichierPDF && <span className="bd-pdf-tag">📄 PDF</span>}
              <span className="bd-id">ID #{book.livreId}</span>
            </div>
            <h1 className="bd-titre">{book.titre}</h1>
            <p className="bd-auteur">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {book.auteur}
            </p>
            <div className="bd-date">
              Ajouté le{" "}
              {new Date(book.dateAjout || book.createdAt).toLocaleDateString(
                "fr-FR",
                { day: "numeric", month: "long", year: "numeric" },
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bd-tabs">
            {["resume", "description", "extrait", "pdf"].map((tab) => {
              const labels = {
                resume: "📖 Résumé",
                description: "📝 Description",
                extrait: "✂️ Extrait",
                pdf: "📄 Lecteur PDF",
              };
              const disabled =
                (tab === "pdf" && !book.fichierPDF) ||
                (tab === "resume" && !book.resume) ||
                (tab === "description" && !book.description) ||
                (tab === "extrait" && !book.extrait);

              return (
                <button
                  key={tab}
                  className={`bd-tab ${activeTab === tab ? "active" : ""} ${disabled ? "disabled" : ""}`}
                  onClick={() => !disabled && setActiveTab(tab)}
                  disabled={disabled}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="bd-tab-content">
            {activeTab === "resume" && (
              <div className="bd-text-block">
                {book.resume ? (
                  <p>{book.resume}</p>
                ) : (
                  <p className="bd-empty">Aucun résumé disponible.</p>
                )}
              </div>
            )}

            {activeTab === "description" && (
              <div className="bd-text-block">
                {book.description ? (
                  <p>{book.description}</p>
                ) : (
                  <p className="bd-empty">Aucune description disponible.</p>
                )}
              </div>
            )}

            {activeTab === "extrait" && (
              <div className="bd-text-block extrait">
                {book.extrait ? (
                  <>
                    <div className="bd-extrait-quote">"</div>
                    <p>{book.extrait}</p>
                  </>
                ) : (
                  <p className="bd-empty">Aucun extrait disponible.</p>
                )}
              </div>
            )}

            {activeTab === "pdf" && (
              <div className="bd-pdf-viewer">
                {book.fichierPDF ? (
                  <>
                    {pdfLoading && (
                      <div className="bd-pdf-loading">
                        <div className="bd-spinner" />
                        <p>Chargement du PDF...</p>
                      </div>
                    )}
                    <iframe
                      src={book.fichierPDF}
                      title={`PDF - ${book.titre}`}
                      className="bd-iframe"
                      onLoad={() => setPdfLoading(false)}
                      style={{ display: pdfLoading ? "none" : "block" }}
                    />
                    <div className="bd-pdf-actions">
                      <a
                        href={book.fichierPDF}
                        target="_blank"
                        rel="noreferrer"
                        className="bd-btn-download"
                      >
                        Ouvrir dans un nouvel onglet ↗
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="bd-no-pdf">
                    <span>📭</span>
                    <p>Aucun fichier PDF associé à ce livre.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BookDetail;
