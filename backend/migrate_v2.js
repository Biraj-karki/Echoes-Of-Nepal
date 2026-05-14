import pool from "./config/db.js";

async function migrateV2() {
    try {
        console.log("Starting Migration V2...");
        
        // 1. Alter destinations table
        await pool.query(`
            ALTER TABLE destinations 
            ADD COLUMN IF NOT EXISTS tips TEXT, 
            ADD COLUMN IF NOT EXISTS how_to_reach TEXT, 
            ADD COLUMN IF NOT EXISTS entry_fee VARCHAR(255);
        `);
        console.log("Updated destinations table.");

        // 2. Alter treks table for Coordinates
        await pool.query(`
            ALTER TABLE treks 
            ADD COLUMN IF NOT EXISTS lat DECIMAL(10,8), 
            ADD COLUMN IF NOT EXISTS lng DECIMAL(11,8);
        `);
        console.log("Updated treks table.");

        // 3. Create Trek Itineraries Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS trek_itineraries (
                id SERIAL PRIMARY KEY,
                trek_id INTEGER REFERENCES treks(id) ON DELETE CASCADE,
                day_number INTEGER NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                distance VARCHAR(100),
                altitude VARCHAR(100),
                duration VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Created trek_itineraries table.");

        console.log("Migration V2 completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrateV2();
