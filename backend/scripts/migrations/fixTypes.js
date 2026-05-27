import pool from "../../config/db.js";

async function fixTypes() {
    try {
        console.log("Fixing types to JSONB...");

        // Drop if exists as wrong type and recreate, or alter
        // Let's just drop and recreate for these specific rich fields to be safe
        await pool.query(`
            ALTER TABLE destinations DROP COLUMN IF EXISTS things_to_do;
            ALTER TABLE destinations DROP COLUMN IF EXISTS tips;
            ALTER TABLE destinations DROP COLUMN IF EXISTS highlights;
            
            ALTER TABLE destinations ADD COLUMN highlights JSONB DEFAULT '[]';
            ALTER TABLE destinations ADD COLUMN things_to_do JSONB DEFAULT '[]';
            ALTER TABLE destinations ADD COLUMN tips JSONB DEFAULT '[]';
        `);

        await pool.query(`
            ALTER TABLE treks DROP COLUMN IF EXISTS highlights;
            ALTER TABLE treks DROP COLUMN IF EXISTS activities;
            
            ALTER TABLE treks ADD COLUMN highlights JSONB DEFAULT '[]';
            ALTER TABLE treks ADD COLUMN activities JSONB DEFAULT '[]';
        `);

        console.log("Types fixed to JSONB.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixTypes();
