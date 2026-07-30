const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT,
    is_admin INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'bottles',
    size_label TEXT NOT NULL,
    price REAL NOT NULL,
    image_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    payment_method TEXT NOT NULL DEFAULT 'cod',
    total REAL NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    address_line TEXT NOT NULL,
    notes TEXT,
    payment_note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

const ADMIN_EMAIL = 'admin@tasneemtech.sa';
const ADMIN_PASSWORD = 'Admin@12345';

const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL);
if (!existingAdmin) {
  db.prepare(
    'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 1)'
  ).run('مدير Tasneem Tech', ADMIN_EMAIL, bcrypt.hashSync(ADMIN_PASSWORD, 10));
  console.log(`✔ تم إنشاء حساب الأدمن: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
} else {
  console.log('• حساب الأدمن موجود بالفعل');
}

const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (productCount === 0) {
  const insert = db.prepare(
    `INSERT INTO products (name, description, category, size_label, price, image_url)
    VALUES (?, ?, ?, ?, ?, ?)`
  );

  const products = [
    ['Tasneem صغيرة', 'كرتونة مياه معدنية طبيعية، مثالية للاستخدام اليومي والمشاوير.', 'bottles', '24 × 200 مل', 18,
      'https://images.unsplash.com/photo-1559839914-17aae19cec71?q=80&w=800&auto=format&fit=crop'],
    ['Tasneem وسط', 'كرتونة مياه معدنية بحجم متوسط مناسبة للمكتب والمنزل.', 'bottles', '12 × 600 مل', 22,
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=800&auto=format&fit=crop'],
    ['Tasneem كبيرة', 'كرتونة مياه معدنية بحجم كبير للعائلة.', 'bottles', '6 × 1.5 لتر', 20,
      'https://images.unsplash.com/photo-1616118132534-381148898bb4?q=80&w=800&auto=format&fit=crop'],
    ['قارورة Tasneem', 'قارورة مياه معدنية كبيرة لتوصيل منزلي بكولر أو مضخة.', 'gallons', 'قارورة 18.9 لتر', 12,
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop'],
  ];

  for (const p of products) insert.run(...p);
  console.log('✔ تم إضافة منتجات تجريبية');
} else {
  console.log('• المنتجات موجودة بالفعل');
}

db.close();