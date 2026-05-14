import pool from "../config/db.js";

async function migrate() {
    try {
        console.log("Starting migration...");
        
        await pool.query(`
            ALTER TABLE destinations 
            ADD COLUMN IF NOT EXISTS highlights TEXT, 
            ADD COLUMN IF NOT EXISTS best_season TEXT, 
            ADD COLUMN IF NOT EXISTS activities TEXT;
        `);
        console.log("Updated destinations table.");

        await pool.query(`
            ALTER TABLE treks 
            ADD COLUMN IF NOT EXISTS highlights TEXT, 
            ADD COLUMN IF NOT EXISTS best_season TEXT, 
            ADD COLUMN IF NOT EXISTS activities TEXT;
        `);
        console.log("Updated treks table.");

        await pool.query(`
            ALTER TABLE stories 
            ADD COLUMN IF NOT EXISTS destination_id INTEGER REFERENCES destinations(id) ON DELETE SET NULL, 
            ADD COLUMN IF NOT EXISTS trek_id INTEGER REFERENCES treks(id) ON DELETE SET NULL;
        `);
        console.log("Updated stories table.");

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
