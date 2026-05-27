import pool from "../../config/db.js";

async function check() {
    try {
        const destCount = await pool.query("SELECT COUNT(*) FROM destinations");
        const trekCount = await pool.query("SELECT COUNT(*) FROM treks");
        const districtCount = await pool.query("SELECT COUNT(*) FROM districts");
        
        console.log("Districts count:", districtCount.rows[0].count);
        console.log("Destinations count:", destCount.rows[0].count);
        console.log("Treks count:", trekCount.rows[0].count);

        if (destCount.rows[0].count > 0) {
            const destSample = await pool.query("SELECT * FROM destinations LIMIT 3");
            console.log("Destinations sample:", JSON.stringify(destSample.rows, null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error("Check failed:", err.message);
        process.exit(1);
    }
}

check();
