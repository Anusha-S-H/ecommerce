const db = require("../config/db");

const dbPromise = db.promise();

const products = [
  {
    name: "Minimal Desk Lamp",
    description: "Sleek adjustable LED desk lamp",
    price: 3299,
    stock: 24,
    image_url: "lamp.jpg",
    category: "electronics",
    deal_type: "LIGHTNING",
    is_new_arrival: false
  },
  {
    name: "Ceramic Pour-Over Set",
    description: "Hand crafted coffee dripper set",
    price: 2499,
    stock: 18,
    image_url: "coffee.jpg",
    category: "kitchen",
    deal_type: "BANK",
    is_new_arrival: true
  },
  {
    name: "Wool Throw Blanket",
    description: "Soft merino wool blanket",
    price: 4599,
    stock: 12,
    image_url: "blanket.jpg",
    category: "home",
    deal_type: "COUPON",
    is_new_arrival: false
  },
  {
    name: "Leather Notebook",
    description: "Premium leather journal",
    price: 1599,
    stock: 35,
    image_url: "notebook.jpg",
    category: "office",
    deal_type: "BANK",
    is_new_arrival: false
  },
  {
    name: "Wireless Charger Pad",
    description: "Fast wireless charging pad",
    price: 1999,
    stock: 42,
    image_url: "charger.jpg",
    category: "electronics",
    deal_type: "LIGHTNING",
    is_new_arrival: true
  }
];

async function seedProducts() {
  try {
    for (const product of products) {
      await dbPromise.query(
        `INSERT INTO products 
        (name, description, price, stock, image_url, category, deal_type, is_new_arrival)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.description,
          product.price,
          product.stock,
          product.image_url,
          product.category,
          product.deal_type,
          product.is_new_arrival,
        ]
      );
    }

    console.log("Products seeded successfully");
  } catch (error) {
    console.error("Insert error:", error);
  } finally {
    db.end();
  }
}

seedProducts();