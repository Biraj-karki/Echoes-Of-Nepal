import pool from "../config/db.js";

const migratePayments = async () => {
    try {
        console.log("Adding payment columns to bookings table...");
        await pool.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
            ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS amount INTEGER;
        `);
        console.log("✅ Payment migration successful!");
    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        process.exit();
    }
};

migratePayments();
