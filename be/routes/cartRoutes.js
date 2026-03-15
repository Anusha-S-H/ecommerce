const express = require("express");
const {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired);
router.get("/", getCart);
router.post("/items", addCartItem);
router.patch("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeCartItem);
router.delete("/clear", clearCart);

module.exports = router;
