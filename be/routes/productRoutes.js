const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { authRequired, adminRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authRequired, adminRequired, createProduct);
router.put("/:id", authRequired, adminRequired, updateProduct);
router.delete("/:id", authRequired, adminRequired, deleteProduct);

module.exports = router;
