const Order = require("../models/Order");
const Book = require("../models/Book");

// ✅ CLIENT – créer commande
exports.createOrder = async (req, res) => {
  try {
    const { books } = req.body;
    let totalPrice = 0;

    for (let item of books) {
      const book = await Book.findById(item.book);
      if (!book) return res.status(404).json({ message: "Livre non trouvé" });
      totalPrice += book.prix * item.quantity;
    }

    const order = await Order.create({
      user: req.user._id,
      books,
      totalPrice,
      status: "En attente",
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CLIENT – voir ses commandes
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("books.book")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN – voir toutes les commandes
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "username email phone")
      .populate("books.book")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN – modifier statut commande (3 statuts seulement)
exports.updateOrderStatus = async (req, res) => {
  try {
    const validStatuses = ["En attente", "Confirmé", "Annulé"];
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Commande non trouvée" });

    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ ADMIN – supprimer commande
exports.deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
