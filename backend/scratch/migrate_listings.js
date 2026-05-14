import pool from "../config/db.js";

const migrateListings = async () => {
    try {
        console.log("Adding rating and amenities to vendor_listings...");
        await pool.query(`
            ALTER TABLE vendor_listings 
            ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 4.5,
            ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]';
        `);
        console.log("✅ Migration successful!");
    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        process.exit();
    }
};

migrateListings();
