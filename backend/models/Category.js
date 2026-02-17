const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  color: { type: String },
  bookCount: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  trending: { type: Boolean, default: false },
});

module.exports = mongoose.model("Category", categorySchema);
