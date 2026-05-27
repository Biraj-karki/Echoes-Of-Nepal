import pool from "../config/db.js";

async function run() {
    try {
        const res = await pool.query("SELECT id, name, email, password_hash FROM admins");
        console.log("Admins present in database:", res.rows);
        process.exit(0);
    } catch (e) {
        console.error("Failed to query admins:", e);
        process.exit(1);
    }
}
run();
