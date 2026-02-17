const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// ACTIVER CORS
router.use(cors());

// Configuration du dossier d'upload
const uploadDir = path.join(__dirname, "../uploads");

const createUploadDirs = () => {
  try {
    const dirs = [
      uploadDir,
      path.join(uploadDir, "covers"),
      path.join(uploadDir, "pdfs"),
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ Dossier créé: ${dir}`);
      }
    });
  } catch (error) {
    console.error("❌ Erreur création dossiers:", error);
  }
};

createUploadDirs();

// ============================================
// CONFIGURATION DE MULTER - VERSION CORRIGÉE
// ============================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // On lit fileType depuis le nom du champ (fieldname)
    // OU depuis les headers de la requête
    let fileType = file.fieldname; // "file" par défaut

    // Essayer de deviner par le mimetype
    if (file.mimetype.startsWith("image/")) {
      fileType = "couverture";
    } else if (file.mimetype === "application/pdf") {
      fileType = "pdf";
    }

    console.log("📁 Destination - Type détecté:", fileType);
    console.log("📁 Mimetype:", file.mimetype);

    if (fileType === "couverture" || file.mimetype.startsWith("image/")) {
      cb(null, path.join(uploadDir, "covers"));
    } else if (
      fileType === "pdf" ||
      fileType === "fichierPDF" ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, path.join(uploadDir, "pdfs"));
    } else {
      cb(null, uploadDir); // Fallback
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);

    const cleanName = nameWithoutExt
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .substring(0, 50);

    cb(null, cleanName + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("🔍 Validation - mimetype:", file.mimetype);
  console.log("🔍 Validation - originalname:", file.originalname);

  // Valider selon le type MIME
  if (file.mimetype.startsWith("image/")) {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      console.log("✓ Image validée");
      cb(null, true);
    } else {
      console.error("❌ Format d'image invalide");
      cb(new Error(`Format d'image invalide. Reçu: ${file.mimetype}`));
    }
  } else if (file.mimetype === "application/pdf") {
    console.log("✓ PDF validé");
    cb(null, true);
  } else {
    console.error("❌ Type de fichier non supporté");
    cb(new Error(`Type de fichier non supporté: ${file.mimetype}`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

// ============================================
// ROUTES
// ============================================

router.get("/test", (req, res) => {
  console.log("✅ Route /test appelée");
  res.json({
    success: true,
    message: "Route d'upload fonctionnelle",
    timestamp: new Date().toISOString(),
  });
});

router.post("/", upload.single("file"), (req, res) => {
  console.log("\n🚀 === UPLOAD ===");
  console.log("Body:", req.body);
  console.log("File:", req.file ? req.file.originalname : "Aucun");

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Aucun fichier reçu",
    });
  }

  // Déterminer le type et construire l'URL
  let fileUrl;
  const isImage = req.file.mimetype.startsWith("image/");
  const isPdf = req.file.mimetype === "application/pdf";

  if (isImage) {
    fileUrl = `http://localhost:3001/uploads/covers/${req.file.filename}`;
  } else if (isPdf) {
    fileUrl = `http://localhost:3001/uploads/pdfs/${req.file.filename}`;
  } else {
    fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  }

  console.log("✅ Upload réussi");
  console.log("🔗 URL:", fileUrl);
  console.log("========================\n");

  res.json({
    success: true,
    message: "Fichier uploadé avec succès",
    fileUrl: fileUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// Gestion des erreurs
router.use((error, req, res, next) => {
  if (req.method === "GET") {
    return next();
  }

  console.error("\n❌ Erreur:", error.message);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Fichier trop volumineux (max 50MB)",
      });
    }
  }

  res.status(400).json({
    success: false,
    message: error.message,
  });
});

module.exports = router;
