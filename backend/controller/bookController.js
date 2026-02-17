const Book = require("../models/Book");

// ✅ Créer un nouveau livre
exports.createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    console.log("✅ Livre créé:", book);

    res.status(201).json(book);
  } catch (error) {
    console.error("❌ Erreur création livre:", error.message);

    res.status(400).json({ message: error.message });
  }
};

// ✅ Récupérer tous les livres
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Modifier un livre
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Supprimer un livre
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    res.json({ message: "Livre supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Récupérer un livre par ID (optionnel)
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
