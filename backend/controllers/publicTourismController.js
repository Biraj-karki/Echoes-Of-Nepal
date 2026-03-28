import pool from "../config/db.js";

export const getPublicTourismData = async (req, res) => {
    try {
        const districtsRes = await pool.query("SELECT * FROM districts ORDER BY name ASC");
        const destinationsRes = await pool.query("SELECT * FROM destinations");
        const treksRes = await pool.query("SELECT * FROM treks");

        const data = districtsRes.rows.map(dist => ({
            ...dist,
            description: dist.description || "",
            province: dist.province || "",
            slug: dist.slug || "",
            destinations: destinationsRes.rows.filter(d => d.district_id === dist.id),
            treks: treksRes.rows.filter(t => t.district_id === dist.id),
            stories: [] 
        }));


        res.json({ districts: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tourism data" });
    }
};
