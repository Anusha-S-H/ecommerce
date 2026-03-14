const db = require("../config/db");

const dbPromise = db.promise();
let productsHasCreatedAtColumn = null;

async function hasProductsCreatedAtColumn() {
  if (productsHasCreatedAtColumn !== null) {
    return productsHasCreatedAtColumn;
  }

  const [columns] = await dbPromise.query("SHOW COLUMNS FROM products");
  productsHasCreatedAtColumn = columns.some((column) => column.Field === "created_at");
  return productsHasCreatedAtColumn;
}

function serializeProduct(product) {
  return {
    id: String(product.id),
    name: product.name,
    description: product.description,
    price: Number(product.price),
    stock: Number(product.stock),
    category: product.category,
    deal_type: product.deal_type,
    is_new_arrival: Boolean(product.is_new_arrival),
    image_url: product.image_url,
    created_at: product.created_at ? new Date(product.created_at).toISOString() : new Date().toISOString(),
  };
}

async function findProductById(id) {
  const hasCreatedAt = await hasProductsCreatedAtColumn();
  const createdAtSelect = hasCreatedAt ? "created_at" : "NULL AS created_at";

  const [products] = await dbPromise.query(
    `SELECT id, name, description, price, stock, image_url, category, deal_type, is_new_arrival, ${createdAtSelect} FROM products WHERE id = ? LIMIT 1`,
    [id]
  );

  return products[0] || null;
}

async function getProducts(req, res) {
  const { search, category, deal_type, new_arrival } = req.query;

  let query = "SELECT id, name, description, price, stock, image_url, category, deal_type, is_new_arrival";
  const params = [];

  try {
    const hasCreatedAt = await hasProductsCreatedAtColumn();
    query += hasCreatedAt ? ", created_at" : ", NULL AS created_at";
    query += " FROM products WHERE 1=1";

    if (search) {
      query += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (deal_type) {
      query += " AND deal_type = ?";
      params.push(deal_type);
    }

    if (new_arrival !== undefined) {
      query += " AND is_new_arrival = ?";
      params.push(new_arrival === "true");
    }

    query += hasCreatedAt ? " ORDER BY created_at DESC, id DESC" : " ORDER BY id DESC";

    const [results] = await dbPromise.query(query, params);
    return res.json(results.map(serializeProduct));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products" });
  }
}

async function getProductById(req, res) {
  const { id } = req.params;

  try {
    const product = await findProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(serializeProduct(product));
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch product" });
  }
}

async function createProduct(req, res) {
  const {
    name,
    description,
    price,
    stock,
    image_url,
    category,
    deal_type,
    is_new_arrival
  } = req.body;

  if (!name || !description || price === undefined || stock === undefined || !image_url || !category) {
    return res.status(400).json({
      message: "name, description, price, stock, image_url and category are required",
    });
  }

  const query =
    "INSERT INTO products (name, description, price, stock, image_url, category, deal_type, is_new_arrival) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  try {
    const [result] = await dbPromise.query(
      query,
      [name, description, price, stock, image_url, category, deal_type || null, Boolean(is_new_arrival)]
    );

    const product = await findProductById(result.insertId);
    return res.status(201).json(serializeProduct(product));
  } catch (error) {
    return res.status(500).json({ message: "Failed to create product" });
  }
}

async function updateProduct(req, res) {
  const { id } = req.params;
  const { name, description, price, stock, image_url, category, deal_type, is_new_arrival } = req.body;

  const query =
    "UPDATE products SET name=?, description=?, price=?, stock=?, image_url=?, category=?, deal_type=?, is_new_arrival=? WHERE id=?";

  try {
    const [result] = await dbPromise.query(
      query,
      [name, description, price, stock, image_url, category, deal_type || null, Boolean(is_new_arrival), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = await findProductById(id);
    return res.json(serializeProduct(product));
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product" });
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const [result] = await dbPromise.query("DELETE FROM products WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};