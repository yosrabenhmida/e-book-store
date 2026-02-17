const router = require("express").Router();
const bookController = require("../controller/bookController");

// Routes CRUD pour les livres
router.post("/", bookController.createBook); // Créer
router.get("/", bookController.getBooks); // Lire tous
router.get("/:id", bookController.getBookById); // Lire un
router.put("/:id", bookController.updateBook); // Modifier ⭐ NOUVELLE ROUTE
router.delete("/:id", bookController.deleteBook); // Supprimer

module.exports = router;
