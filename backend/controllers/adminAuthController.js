import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const result = await pool.query("SELECT * FROM admins WHERE email=$1", [email]);
    const admin = result.rows[0];

    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("adminLogin error:", err.message);
    res.status(500).json({ error: "Admin login failed" });
  }
};

export const adminMe = async (req, res) => {
  try {
    const adminId = req.admin.adminId;

    const result = await pool.query(
      "SELECT id, name, email, created_at FROM admins WHERE id=$1",
      [adminId]
    );

    const admin = result.rows[0];
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    res.json({ admin });
  } catch (err) {
    res.status(500).json({ error: "Failed to load admin" });
  }
};
