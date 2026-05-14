import pool from "./config/db.js";

async function checkColumns() {
    const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'destinations';
    `);
    console.table(res.rows);
    process.exit(0);
}
checkColumns();
