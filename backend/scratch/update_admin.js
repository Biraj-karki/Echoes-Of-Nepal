import pool from "../config/db.js";
import bcrypt from "bcrypt";

async function run() {
    try {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        // Let's update the existing Admin
        await pool.query(
            "UPDATE admins SET email = $1, password_hash = $2 WHERE id = 1",
            ["admin@gmail.com", hashedPassword]
        );
        console.log("Successfully updated Admin account: email='admin@gmail.com', password='admin123'");
        process.exit(0);
    } catch (e) {
        console.error("Failed to update admin:", e);
        process.exit(1);
    }
}
run();
