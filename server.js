import 'dotenv/config';
import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('Error opening db', err);
  else {
    console.log('Connected to SQLite DB');
    db.serialize(() => {
      // Create tables
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        name TEXT
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS spaces (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        location TEXT,
        price INTEGER,
        rating REAL,
        status TEXT,
        type TEXT,
        imageUrl TEXT,
        features TEXT,
        isRemoteFriendly BOOLEAN
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        spaceId INTEGER,
        date TEXT,
        timeSlots TEXT,
        totalPrice INTEGER,
        status TEXT
      )`);

      // Seed users from .env
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (row && row.count === 0) {
          const insertUser = db.prepare('INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)');
          insertUser.run(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, 'admin', process.env.ADMIN_NAME);
          insertUser.run(process.env.USER1_USERNAME, process.env.USER1_PASSWORD, 'user', process.env.USER1_NAME);
          insertUser.run(process.env.USER2_USERNAME, process.env.USER2_PASSWORD, 'user', process.env.USER2_NAME);
          insertUser.finalize();
          console.log('Seeded users from .env');
        } else {
          // Update existing users in case .env was modified
          const updateUser = db.prepare('UPDATE users SET username = ?, password = ?, name = ? WHERE id = ?');
          updateUser.run(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, process.env.ADMIN_NAME, 1);
          updateUser.run(process.env.USER1_USERNAME, process.env.USER1_PASSWORD, process.env.USER1_NAME, 2);
          updateUser.run(process.env.USER2_USERNAME, process.env.USER2_PASSWORD, process.env.USER2_NAME, 3);
          updateUser.finalize();
          console.log('Updated users from .env');
        }
      });

      db.get('SELECT COUNT(*) as count FROM spaces', (err, row) => {
        if (row && row.count === 0) {
          const insertSpace = db.prepare('INSERT INTO spaces (name, location, price, rating, status, type, imageUrl, features, isRemoteFriendly) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
          insertSpace.run('Co-work Hub Jakarta', 'Jakarta Selatan, Indonesia', 30000, 4.8, 'Available', 'Desk', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', JSON.stringify(["High-speed Wi-Fi", "Free Coffee", "Meeting Room Access"]), true);
          insertSpace.run('Quiet Zone Bandung', 'Bandung, Indonesia', 25000, 4.6, 'Available', 'Meeting Room', 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=800', JSON.stringify(["Whiteboard", "Projector", "Soundproof"]), true);
          insertSpace.run('Global Connect Bali', 'Canggu, Bali', 50000, 4.9, 'Available', 'Desk', 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&q=80&w=800', JSON.stringify(["Ocean View", "Ergonomic Chair", "24/7 Access"]), true);
          insertSpace.run('Urban Nest Surabaya', 'Surabaya, Indonesia', 20000, 4.5, 'Available', 'Desk', 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=800', JSON.stringify(["Free Printing", "Lounge Area"]), false);
          insertSpace.finalize();
        }
      });
    });
  }
});

// --- API ROUTES ---

// LOGIN
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT id, username, role, name FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) res.json(row);
    else res.status(401).json({ error: 'Invalid credentials' });
  });
});

// SPACES
app.get('/api/spaces', (req, res) => {
  db.all('SELECT * FROM spaces', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted = rows.map(r => ({ ...r, features: JSON.parse(r.features), isRemoteFriendly: Boolean(r.isRemoteFriendly) }));
    res.json(formatted);
  });
});

app.post('/api/spaces', (req, res) => {
  const { name, location, price, type, status, imageUrl, features, isRemoteFriendly } = req.body;
  const sql = 'INSERT INTO spaces (name, location, price, rating, status, type, imageUrl, features, isRemoteFriendly) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.run(sql, [name, location, price, 5.0, status, type, imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800', JSON.stringify(features || []), isRemoteFriendly ? 1 : 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/spaces/:id', (req, res) => {
  const { name, location, price, type, status, imageUrl } = req.body;
  const sql = 'UPDATE spaces SET name = ?, location = ?, price = ?, type = ?, status = ?, imageUrl = ? WHERE id = ?';
  db.run(sql, [name, location, price, type, status, imageUrl, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

app.delete('/api/spaces/:id', (req, res) => {
  db.run('DELETE FROM spaces WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// RESERVATIONS
app.get('/api/reservations', (req, res) => {
  const sql = `SELECT r.*, s.name as spaceName, s.location as spaceLocation, s.type as spaceType, s.price as spacePrice, u.name as userName
    FROM reservations r
    LEFT JOIN spaces s ON r.spaceId = s.id
    LEFT JOIN users u ON r.userId = u.id
    ORDER BY r.id DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// USER-SPECIFIC RESERVATIONS
app.get('/api/reservations/user/:userId', (req, res) => {
  const sql = `SELECT r.*, s.name as spaceName, s.location as spaceLocation, s.type as spaceType, s.price as spacePrice, s.imageUrl as spaceImage
    FROM reservations r
    LEFT JOIN spaces s ON r.spaceId = s.id
    WHERE r.userId = ?
    ORDER BY r.id DESC`;
  db.all(sql, [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET BOOKED SLOTS for a specific space and date
app.get('/api/reservations/booked-slots', (req, res) => {
  const { spaceId, date } = req.query;
  const sql = `SELECT timeSlots FROM reservations WHERE spaceId = ? AND date = ? AND status != 'Cancelled'`;
  db.all(sql, [spaceId, date], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Flatten all booked time slots
    let bookedSlots = [];
    rows.forEach(row => {
      try {
        const slots = JSON.parse(row.timeSlots);
        bookedSlots = bookedSlots.concat(slots);
      } catch(e) {}
    });
    res.json(bookedSlots);
  });
});

app.post('/api/reservations', (req, res) => {
  const { userId, spaceId, date, timeSlots, totalPrice, status } = req.body;
  db.run('INSERT INTO reservations (userId, spaceId, date, timeSlots, totalPrice, status) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, spaceId, date, JSON.stringify(timeSlots || []), totalPrice || 0, status || 'Pending'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.put('/api/reservations/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE reservations SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ changes: this.changes });
  });
});

// USERS
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, role, name FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
