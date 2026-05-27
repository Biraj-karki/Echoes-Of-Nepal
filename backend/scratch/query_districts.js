import pool from "../config/db.js";

async function run() {
    try {
        console.log("Starting DB migration and cleanup for Kaski...");
        
        // 1. Update destinations
        const destUpdate = await pool.query(
            "UPDATE destinations SET district_id = 'KASKI' WHERE district_id = 'kaski'"
        );
        console.log(`Updated ${destUpdate.rowCount} destinations to KASKI`);

        // 2. Update treks
        const trekUpdate = await pool.query(
            "UPDATE treks SET district_id = 'KASKI' WHERE district_id = 'kaski'"
        );
        console.log(`Updated ${trekUpdate.rowCount} treks to KASKI`);

        // 3. Delete lowercase 'kaski' district
        const distDelete = await pool.query(
            "DELETE FROM districts WHERE id = 'kaski'"
        );
        console.log(`Deleted lowercase 'kaski' district: ${distDelete.rowCount}`);

        console.log("Cleanup finished successfully!");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}
run();
