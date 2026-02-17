const router = require("express").Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const orderController = require("../controller/orderController");

// CLIENT
router.post("/", protect, authorize("client"), orderController.createOrder);
router.get("/my", protect, authorize("client"), orderController.getMyOrders);

// ADMIN
router.get("/", protect, authorize("admin"), orderController.getAllOrders);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  orderController.updateOrderStatus,
);
router.delete("/:id", protect, authorize("admin"), orderController.deleteOrder);

module.exports = router;
