const router = require("express").Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const Book = require("../models/Book");
const User = require("../models/User");
const Order = require("../models/Order");
const Category = require("../models/Category");

router.get("/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const books = await Book.countDocuments();
    const users = await User.countDocuments({ role: "client" });
    const orders = await Order.countDocuments();
    const categories = await Category.countDocuments();

    res.json({ books, users, orders, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
