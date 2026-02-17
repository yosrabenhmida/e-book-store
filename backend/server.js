const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// ============================================
// CONNEXION MONGODB

// ============================================

mongoose
  .connect("mongodb://localhost:27017/e-book", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✓ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur MongoDB:", err));

// ============================================
// ROUTES
// ============================================

// Route de test
app.get("/", (req, res) => {
  res.json({
    message: "API E-book en ligne",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Routes API
const booksRouter = require("./routes/bookRoutes");
const categoriesRouter = require("./routes/categoryRoutes");
const uploadRouter = require("./routes/upload");
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/books", booksRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/upload", uploadRouter);

// ============================================
// GESTION DES ERREURS
// ============================================

// Route 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route non trouvée",
    path: req.path,
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur:", err);
  res.status(500).json({
    error: "Erreur serveur",
    message: err.message,
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("\n========================================");
  console.log(`✓ Serveur démarré sur le port ${PORT}`);
  console.log(`✓ API disponible sur: http://localhost:${PORT}`);
  console.log(`✓ Uploads: http://localhost:${PORT}/uploads`);
  console.log("========================================\n");
});

module.exports = app;
