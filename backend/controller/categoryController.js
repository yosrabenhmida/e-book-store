const Category = require("../models/Category");

// Créer une catégorie
exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer toutes les catégories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer une catégorie par ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Catégorie non trouvée" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour une catégorie
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category)
      return res.status(404).json({ message: "Catégorie non trouvée" });

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category)
      return res.status(404).json({ message: "Catégorie non trouvée" });

    res.json({ message: "Catégorie supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour les statistiques d'une catégorie
exports.updateCategoryStats = async (req, res) => {
  try {
    const { bookCount, totalSales } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        $set: { bookCount, totalSales },
      },
      { new: true },
    );

    if (!category)
      return res.status(404).json({ message: "Catégorie non trouvée" });

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer les catégories trending
exports.getTrendingCategories = async (req, res) => {
  try {
    const categories = await Category.find({ trending: true }).sort({
      totalSales: -1,
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
