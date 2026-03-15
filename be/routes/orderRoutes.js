const express = require("express");
const {
  getOrders,
  placeOrder,
  simulatePayment,
} = require("../controllers/orderController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired);
router.get("/", getOrders);
router.post("/", placeOrder);
router.patch("/:id/pay", simulatePayment);

module.exports = router;
