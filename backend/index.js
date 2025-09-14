const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Lalit@123", // change if different
  database: "auth_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err);
    return;
  }
  console.log("✅ Connected to MySQL database");
});

// ================= ROUTES =================

// ✅ User / Store-owner / Admin Registration (for users table)
app.post("/register", (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !address || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const checkSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const insertSql =
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)";
    db.query(insertSql, [name, email, password, address, role], (err2) => {
      if (err2) {
        console.error("Error inserting user:", err2);
        return res.status(500).json({ message: "Server error" });
      }
      res.json({ message: "✅ Registered successfully!" });
    });
  });
});

// ✅ Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = results[0];
    res.json({
      message: "Login successful!",
      user: {
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  });
});

// ✅ Admin can add new users
app.post("/users", (req, res) => {
  const { name, email, password, address } = req.body;

  if (!name || !email || !password || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const checkSql = "SELECT * FROM users WHERE email = ?";
  db.query(checkSql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const insertSql =
      "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, 'user')";
    db.query(insertSql, [name, email, password, address], (err2) => {
      if (err2) {
        console.error("Error inserting user:", err2);
        return res.status(500).json({ message: "Server error" });
      }
      res.json({ message: "✅ User added successfully!" });
    });
  });
});

// ✅ Admin can add new stores
app.post("/stores", (req, res) => {
  const { name, purpose, address, email, password } = req.body;

  if (!name || !purpose || !address || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const checkSql = "SELECT * FROM stores WHERE email = ?";
  db.query(checkSql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "Store email already exists" });
    }

    const insertSql =
      "INSERT INTO stores (name, purpose, address, email, password) VALUES (?, ?, ?, ?, ?)";
    db.query(insertSql, [name, purpose, address, email, password], (err2) => {
      if (err2) {
        console.error("Error inserting store:", err2);
        return res.status(500).json({ message: "Server error" });
      }

      // also add this store-owner to users table
      db.query(
        "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, 'store-owner')",
        [name, email, password, address],
        (err3) => {
          if (err3) {
            console.error("Error adding store-owner to users:", err3);
          }
        }
      );

      res.json({ message: "✅ Store added successfully!" });
    });
  });
});

// ✅ Get all users (for Admin)
app.get("/users", (req, res) => {
  db.query("SELECT id, name, email, address, role FROM users", (err, result) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Error fetching users" });
    }
    res.json(result);
  });
});

// ✅ Get all stores
app.get("/stores", (req, res) => {
  db.query("SELECT * FROM stores", (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
});

// ✅ Delete a user by ID
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Error deleting user" });
    }
    res.json({ message: "User deleted successfully" });
  });
});

// ✅ Delete a store by ID
app.delete("/stores/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM stores WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting store:", err);
      return res.status(500).json({ error: "Error deleting store" });
    }
    res.json({ message: "Store deleted successfully" });
  });
});

// ✅ Change password
app.put("/change-password", (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = results[0];
    if (user.password !== oldPassword)
      return res.status(400).json({ message: "Old password is incorrect" });

    db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [newPassword, email],
      (err2) => {
        if (err2) return res.status(500).json({ message: "Server error" });
        res.json({ message: "✅ Password changed successfully!" });
      }
    );
  });
});

// ✅ Add or update rating
app.post("/ratings", (req, res) => {
  const { user_email, store_id, score } = req.body;

  if (!user_email || !store_id || !score) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql =
    "INSERT INTO ratings (user_email, store_id, score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE score = ?";
  db.query(sql, [user_email, store_id, score, score], (err) => {
    if (err) {
      console.error("Error inserting rating:", err);
      return res.status(500).json({ message: "Server error" });
    }

    // Calculate updated average rating
    db.query(
      "SELECT AVG(score) AS avgRating, COUNT(*) AS ratingsCount FROM ratings WHERE store_id = ?",
      [store_id],
      (err, results) => {
        if (err) {
          console.error("Error calculating rating:", err);
          return res.status(500).json({ message: "Server error" });
        }

        const { avgRating, ratingsCount } = results[0];
        res.json({
          message: "✅ Rating submitted!",
          avgRating: parseFloat(avgRating) || 0,
          ratingsCount: ratingsCount || 0,
        });
      }
    );
  });
});

// ✅ Get all ratings for a store
app.get("/ratings/:storeId", (req, res) => {
  const { storeId } = req.params;

  db.query(
    "SELECT user_email, score FROM ratings WHERE store_id = ?",
    [storeId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results); // returns array of ratings
    }
  );
});

// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
