const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    livreId: {
      type: Number,
      unique: true,
      required: [true, "L'ID du livre est obligatoire"],
    },
    titre: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
    },
    auteur: {
      type: String,
      required: [true, "L'auteur est obligatoire"],
      trim: true,
    },
    categorie: {
      type: String,
      required: [true, "La catégorie est obligatoire"],
      trim: true,
    },
    prix: {
      type: Number,
      required: [true, "Le prix est obligatoire"],
      min: [0, "Le prix doit être positif"],
    },
    resume: {
      type: String,
      required: [true, "Le résumé est obligatoire"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    extrait: {
      type: String,
      default: "",
      trim: true,
    },
    couverture: {
      type: String,
      default: "https://via.placeholder.com/400x600?text=Pas+d'image",
    },
    fichierPDF: {
      type: String,
      default: "",
    },
    dateAjout: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index pour recherche rapide (inclut resume)
bookSchema.index({ titre: "text", auteur: "text", resume: "text" });

// Méthode pour télécharger
bookSchema.methods.telecharger = function () {
  return this.fichierPDF;
};

// Méthode pour modifier un livre
bookSchema.methods.modifierLivre = function (updates) {
  Object.assign(this, updates);
  return this.save();
};

// Méthode pour supprimer un livre
bookSchema.methods.supprimerLivre = function () {
  return this.remove();
};

// Méthode statique pour rechercher (inclut resume)
bookSchema.statics.rechercher = function (query, filtres = {}) {
  const searchQuery = {
    $or: [
      { titre: { $regex: query, $options: "i" } },
      { auteur: { $regex: query, $options: "i" } },
      { resume: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  };

  if (filtres.categorie) {
    searchQuery.categorie = filtres.categorie;
  }

  return this.find(searchQuery);
};

// Auto-increment pour livreId
bookSchema.pre("validate", async function (next) {
  if (this.isNew && !this.livreId) {
    try {
      const lastBook = await this.constructor.findOne(
        {},
        {},
        { sort: { livreId: -1 } },
      );
      this.livreId = lastBook ? lastBook.livreId + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("Livre", bookSchema);
