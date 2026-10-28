// backend/server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// ====================
// MySQL Connection
// ====================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Root", // <- apna MySQL Workbench password daalna
  database: "sponsorship_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ MySQL Connected Successfully!");
  }
});

// ====================
// ADMIN LOGIN
// ====================
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM admin WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "DB error" });
    if (results.length > 0) return res.json({ success: true });
    res.json({ success: false, message: "Invalid credentials" });
  });
});

// ====================
// FETCH ALL EVENTS
// ====================
app.get("/api/events", (req, res) => {
  const sql = "SELECT * FROM events ORDER BY date ASC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).send({ error: "DB error" });
    res.json(results);
  });
});

// ====================
// SUBMIT SPONSOR REQUEST
// ====================
app.post("/api/request", (req, res) => {
  const { event_id, sponsor_name, message } = req.body;
  if (!event_id || !sponsor_name) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const sql = "INSERT INTO requests (event_id, sponsor_name, message) VALUES (?, ?, ?)";
  db.query(sql, [event_id, sponsor_name, message || ""], (err, result) => {
    if (err) {
      console.error("Error inserting request:", err);
      return res.status(500).json({ success: false, message: "DB error" });
    }
    res.json({ success: true, message: "Request submitted successfully", id: result.insertId });
  });
});

// ====================
// ADMIN: GET ALL REQUESTS
// ====================
app.get("/api/requests", (req, res) => {
  const sql = `
    SELECT r.id, r.sponsor_name, r.message, r.status, r.event_id, e.name AS event_name, e.date
    FROM requests r
    JOIN events e ON r.event_id = e.id
    ORDER BY r.id DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "DB error" });
    res.json(results);
  });
});

// ====================
// ADMIN: UPDATE REQUEST STATUS
// ====================
app.put("/api/requests/:id", (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ success: false, message: "Status required" });

  const sql = "UPDATE requests SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "DB error" });
    res.json({ success: true, message: "Status updated" });
  });
});

// ====================
// ADMIN: DELETE REQUEST
// ====================
app.delete("/api/requests/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM requests WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success: false, message: "DB error" });
    res.json({ success: true, message: "Request deleted" });
  });
});

// ====================
// SPONSOR: VIEW OWN REQUESTS + STATUS
// ====================
app.get("/api/sponsor/:name", (req, res) => {
  const sponsor = req.params.name;
  const sql = `
    SELECT r.id, r.message, r.status, e.name AS event_name, e.date
    FROM requests r
    JOIN events e ON r.event_id = e.id
    WHERE r.sponsor_name = ?
    ORDER BY r.id DESC
  `;
  db.query(sql, [sponsor], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "DB error" });
    res.json(results);
  });
});

// ====================
// START SERVER
// ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
