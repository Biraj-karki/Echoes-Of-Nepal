import pool from "./config/db.js";

async function prepare() {
    try {
        console.log("Preparing database for seeding...");
        
        // Ensure constraints
        await pool.query("ALTER TABLE destinations ADD CONSTRAINT unique_dest_name UNIQUE (name)").catch(e => console.log("Dest unique constraint already exists or error."));
        await pool.query("ALTER TABLE treks ADD CONSTRAINT unique_trek_name UNIQUE (name)").catch(e => console.log("Trek unique constraint already exists or error."));
        
        console.log("Database prepared.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

prepare();
