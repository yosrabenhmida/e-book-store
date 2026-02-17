const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");

// Routes CRUD
router.get("/", categoryController.getCategories); // Récupérer toutes les catégories
router.post("/", categoryController.createCategory); // Créer une catégorie
router.get("/trending", categoryController.getTrendingCategories); // Récupérer les catégories trending
router.get("/:id", categoryController.getCategoryById); // Récupérer une catégorie par ID
router.put("/:id", categoryController.updateCategory); // Mettre à jour une catégorie
router.patch("/:id/stats", categoryController.updateCategoryStats); // Mettre à jour les stats
router.delete("/:id", categoryController.deleteCategory); // Supprimer une catégorie

module.exports = router;
