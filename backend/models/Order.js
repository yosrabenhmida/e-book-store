const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    books: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        quantity: Number,
      },
    ],
    totalPrice: Number,
    status: {
      type: String,
      default: "En attente",
    },
  },
  { timestamps: true },
);
