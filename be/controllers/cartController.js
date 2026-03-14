const db = require("../config/db");

const dbPromise = db.promise();

function serializeProduct(product) {
  if (!product || product.product_id == null) {
    return undefined;
  }

  return {
    id: String(product.product_id),
    name: product.name,
    description: product.description,
    price: Number(product.price),
    stock: Number(product.stock),
    category: product.category,
    deal_type: product.deal_type,
    is_new_arrival: Boolean(product.is_new_arrival),
    image_url: product.image_url,
    created_at: product.product_created_at
      ? new Date(product.product_created_at).toISOString()
      : new Date().toISOString(),
  };
}

function serializeCart(cartId, userId, rows) {
  return {
    id: String(cartId),
    user_id: String(userId),
    items: rows
      .filter((row) => row.cart_item_id != null)
      .map((row) => ({
        id: String(row.cart_item_id),
        cart_id: String(row.cart_id),
        product_id: String(row.product_id),
        quantity: Number(row.quantity),
        product: serializeProduct(row),
      })),
  };
}

async function ensureCart(userId) {
  const [existingCarts] = await dbPromise.query(
    "SELECT id FROM carts WHERE user_id = ? LIMIT 1",
    [userId]
  );

  if (existingCarts.length > 0) {
    return existingCarts[0].id;
  }

  const [result] = await dbPromise.query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
  return result.insertId;
}

async function fetchCart(userId) {
  const cartId = await ensureCart(userId);
  const [rows] = await dbPromise.query(
    `SELECT
      c.id AS cart_id,
      c.user_id,
      ci.id AS cart_item_id,
      ci.quantity,
      p.id AS product_id,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.image_url,
      p.category,
      p.deal_type,
      p.is_new_arrival,
      NULL AS product_created_at
    FROM carts c
    LEFT JOIN cart_items ci ON ci.cart_id = c.id
    LEFT JOIN products p ON p.id = ci.product_id
    WHERE c.user_id = ?
    ORDER BY ci.id ASC`,
    [userId]
  );

  return serializeCart(cartId, userId, rows);
}

async function getCart(req, res) {
  try {
    const cart = await fetchCart(req.user.id);
    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
}

async function addCartItem(req, res) {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;
  const qty = Number(quantity || 1);

  if (!product_id || !Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ message: "product_id and a positive quantity are required" });
  }

  try {
    const cartId = await ensureCart(userId);
    const [products] = await dbPromise.query(
      "SELECT id, stock FROM products WHERE id = ? LIMIT 1",
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [items] = await dbPromise.query(
      "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1",
      [cartId, product_id]
    );

    const nextQuantity = items.length > 0 ? Number(items[0].quantity) + qty : qty;
    if (nextQuantity > Number(products[0].stock)) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock" });
    }

    if (items.length > 0) {
      await dbPromise.query(
        "UPDATE cart_items SET quantity = ? WHERE id = ?",
        [nextQuantity, items[0].id]
      );
    } else {
      await dbPromise.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
        [cartId, product_id, qty]
      );
    }

    const cart = await fetchCart(userId);
    return res.status(items.length > 0 ? 200 : 201).json(cart);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update cart" });
  }
}

async function updateCartItem(req, res) {
  const userId = req.user.id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  const qty = Number(quantity);

  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ message: "quantity must be a positive integer" });
  }

  try {
    const [items] = await dbPromise.query(
      `SELECT ci.id, ci.cart_id, ci.product_id, p.stock
       FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       JOIN products p ON p.id = ci.product_id
       WHERE ci.id = ? AND c.user_id = ?
       LIMIT 1`,
      [itemId, userId]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (qty > Number(items[0].stock)) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock" });
    }

    await dbPromise.query(
      "UPDATE cart_items SET quantity = ? WHERE id = ?",
      [qty, itemId]
    );

    const cart = await fetchCart(userId);
    return res.json(cart);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update cart item" });
  }
}

async function removeCartItem(req, res) {
  const userId = req.user.id;
  const { itemId } = req.params;

  try {
    const [result] = await dbPromise.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       WHERE ci.id = ? AND c.user_id = ?`,
      [itemId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove cart item" });
  }
}

async function clearCart(req, res) {
  const userId = req.user.id;

  try {
    await dbPromise.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       WHERE c.user_id = ?`,
      [userId]
    );

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to clear cart" });
  }
}

module.exports = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};