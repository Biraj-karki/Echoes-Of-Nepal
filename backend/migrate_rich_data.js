import pool from "./config/db.js";

async function migrateRichData() {
    try {
        console.log("Starting Rich Data Migration...");

        // 1. Update destinations table
        await pool.query(`
            ALTER TABLE destinations 
            ADD COLUMN IF NOT EXISTS things_to_do JSONB DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS best_time TEXT;
        `);

        // Handle highlights (text to jsonb)
        await pool.query(`
            ALTER TABLE destinations 
            ALTER COLUMN highlights TYPE JSONB USING to_jsonb(highlights);
        `);

        // Handle tips (if it's text[] or text)
        await pool.query(`
            ALTER TABLE destinations 
            ALTER COLUMN tips TYPE JSONB USING to_jsonb(tips);
        `);
        console.log("Updated destinations table.");

        // 2. Update treks table
        await pool.query(`
            ALTER TABLE treks
            ADD COLUMN IF NOT EXISTS best_time TEXT,
            ADD COLUMN IF NOT EXISTS route TEXT,
            ADD COLUMN IF NOT EXISTS activities JSONB DEFAULT '[]';
        `);
        
        await pool.query(`
            ALTER TABLE treks
            ALTER COLUMN highlights TYPE JSONB USING to_jsonb(highlights);
        `);
        console.log("Updated treks table.");

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrateRichData();
