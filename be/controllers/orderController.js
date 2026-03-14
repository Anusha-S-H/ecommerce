const db = require("../config/db");

const dbPromise = db.promise();
let orderSchemaCache = null;

async function getOrderSchema() {
  if (orderSchemaCache) {
    return orderSchemaCache;
  }

  const [orderColumns] = await dbPromise.query("SHOW COLUMNS FROM orders");
  const orderColumnNames = orderColumns.map((column) => column.Field);
  const totalColumn = orderColumnNames.includes("total_amount") ? "total_amount" : "total";

  const [orderItemsTableRows] = await dbPromise.query("SHOW TABLES LIKE 'order_items'");
  const hasOrderItemsTable = orderItemsTableRows.length > 0;

  orderSchemaCache = {
    totalColumn,
    hasOrderItemsTable,
  };

  return orderSchemaCache;
}

function serializeProduct(product) {
  if (!product || product.product_id == null) {
    return undefined;
  }

  return {
    id: String(product.product_id),
    name: product.name,
    description: product.description,
    price: Number(product.product_price),
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

function mapOrders(rows) {
  const orders = new Map();

  for (const row of rows) {
    if (!orders.has(row.order_id)) {
      orders.set(row.order_id, {
        id: String(row.order_id),
        user_id: String(row.user_id),
        total_amount: Number(row.total_amount),
        status: row.status,
        created_at: new Date(row.order_created_at).toISOString(),
        items: [],
      });
    }

    if (row.order_item_id != null) {
      orders.get(row.order_id).items.push({
        id: String(row.order_item_id),
        order_id: String(row.order_id),
        product_id: String(row.order_product_id),
        quantity: Number(row.quantity),
        price: Number(row.item_price),
        product: serializeProduct(row),
      });
    }
  }

  return Array.from(orders.values());
}

async function fetchOrders(user, connection = dbPromise) {
  const schema = await getOrderSchema();

  if (!schema.hasOrderItemsTable) {
    let query = `
      SELECT
        o.id AS order_id,
        o.user_id,
        o.${schema.totalColumn} AS total_amount,
        o.status,
        o.created_at AS order_created_at
      FROM orders o`;
    const params = [];

    if (user.role !== "admin") {
      query += " WHERE o.user_id = ?";
      params.push(user.id);
    }

    query += " ORDER BY o.created_at DESC, o.id DESC";

    const [rows] = await connection.query(query, params);
    return rows.map((row) => ({
      id: String(row.order_id),
      user_id: String(row.user_id),
      total_amount: Number(row.total_amount),
      status: row.status,
      created_at: new Date(row.order_created_at).toISOString(),
      items: [],
    }));
  }

  let query = `
    SELECT
      o.id AS order_id,
      o.user_id,
      o.${schema.totalColumn} AS total_amount,
      o.status,
      o.created_at AS order_created_at,
      oi.id AS order_item_id,
      oi.product_id AS order_product_id,
      oi.quantity,
      oi.price AS item_price,
      p.id AS product_id,
      p.name,
      p.description,
      p.price AS product_price,
      p.stock,
      p.image_url,
      p.category,
      p.deal_type,
      p.is_new_arrival,
      NULL AS product_created_at
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products p ON p.id = oi.product_id`;
  const params = [];

  if (user.role !== "admin") {
    query += " WHERE o.user_id = ?";
    params.push(user.id);
  }

  query += " ORDER BY o.created_at DESC, o.id DESC, oi.id ASC";

  const [rows] = await connection.query(query, params);
  return mapOrders(rows);
}

async function fetchOrderById(orderId, user, connection = dbPromise) {
  const schema = await getOrderSchema();

  if (!schema.hasOrderItemsTable) {
    let query = `
      SELECT
        o.id AS order_id,
        o.user_id,
        o.${schema.totalColumn} AS total_amount,
        o.status,
        o.created_at AS order_created_at
      FROM orders o
      WHERE o.id = ?`;
    const params = [orderId];

    if (user.role !== "admin") {
      query += " AND o.user_id = ?";
      params.push(user.id);
    }

    const [rows] = await connection.query(query, params);
    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      id: String(row.order_id),
      user_id: String(row.user_id),
      total_amount: Number(row.total_amount),
      status: row.status,
      created_at: new Date(row.order_created_at).toISOString(),
      items: [],
    };
  }

  let query = `
    SELECT
      o.id AS order_id,
      o.user_id,
      o.${schema.totalColumn} AS total_amount,
      o.status,
      o.created_at AS order_created_at,
      oi.id AS order_item_id,
      oi.product_id AS order_product_id,
      oi.quantity,
      oi.price AS item_price,
      p.id AS product_id,
      p.name,
      p.description,
      p.price AS product_price,
      p.stock,
      p.image_url,
      p.category,
      p.deal_type,
      p.is_new_arrival,
      NULL AS product_created_at
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE o.id = ?`;
  const params = [orderId];

  if (user.role !== "admin") {
    query += " AND o.user_id = ?";
    params.push(user.id);
  }

  query += " ORDER BY oi.id ASC";

  const [rows] = await connection.query(query, params);
  const orders = mapOrders(rows);
  return orders[0] || null;
}

async function getOrders(req, res) {
  try {
    const orders = await fetchOrders(req.user);
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

async function placeOrder(req, res) {
  const schema = await getOrderSchema();
  const connection = await dbPromise.getConnection();

  try {
    await connection.beginTransaction();

    const [cartRows] = await connection.query(
      `SELECT
        c.id AS cart_id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.stock
      FROM carts c
      JOIN cart_items ci ON ci.cart_id = c.id
      JOIN products p ON p.id = ci.product_id
      WHERE c.user_id = ?
      FOR UPDATE`,
      [req.user.id]
    );

    if (cartRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (const item of cartRows) {
      if (Number(item.quantity) > Number(item.stock)) {
        await connection.rollback();
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }
    }

    const totalAmount = cartRows.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, ${schema.totalColumn}, status) VALUES (?, ?, ?)`,
      [req.user.id, totalAmount, "PENDING"]
    );

    const orderId = orderResult.insertId;

    if (schema.hasOrderItemsTable) {
      const orderItems = cartRows.map((item) => [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
      ]);

      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
        [orderItems]
      );
    }

    for (const item of cartRows) {
      await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    await connection.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON c.id = ci.cart_id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    await connection.commit();

    if (schema.hasOrderItemsTable) {
      const order = await fetchOrderById(orderId, req.user, connection);
      return res.status(201).json(order);
    }

    const fallbackOrder = {
      id: String(orderId),
      user_id: String(req.user.id),
      total_amount: Number(totalAmount),
      status: "PENDING",
      created_at: new Date().toISOString(),
      items: cartRows.map((item, index) => ({
        id: `${orderId}_${index + 1}`,
        order_id: String(orderId),
        product_id: String(item.product_id),
        quantity: Number(item.quantity),
        price: Number(item.price),
        product: {
          id: String(item.product_id),
          name: item.name,
          description: "",
          price: Number(item.price),
          stock: Number(item.stock),
          category: "arrivals",
          deal_type: null,
          is_new_arrival: false,
          image_url: "",
          created_at: new Date().toISOString(),
        },
      })),
    };

    return res.status(201).json(fallbackOrder);
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: "Failed to place order" });
  } finally {
    connection.release();
  }
}

async function simulatePayment(req, res) {
  const { id } = req.params;
  const { success } = req.body;

  if (typeof success !== "boolean") {
    return res.status(400).json({ message: "success boolean is required" });
  }

  try {
    const existingOrder = await fetchOrderById(id, req.user);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    await dbPromise.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [success ? "PAID" : "FAILED", id]
    );

    const updatedOrder = await fetchOrderById(id, req.user);
    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update payment status" });
  }
}

module.exports = {
  getOrders,
  placeOrder,
  simulatePayment,
};
