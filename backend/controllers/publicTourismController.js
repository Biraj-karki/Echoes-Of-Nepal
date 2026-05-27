import pool from "../config/db.js";

const normalizeDistrictId = (value) => String(value ?? "").trim().toUpperCase();

export const getPublicTourismData = async (req, res) => {
    try {
        const districtsRes = await pool.query("SELECT * FROM districts ORDER BY name ASC");
        const destinationsRes = await pool.query("SELECT * FROM destinations");
        const treksRes = await pool.query("SELECT * FROM treks");

        const destinationsByDistrict = new Map();
        for (const destination of destinationsRes.rows) {
            const key = normalizeDistrictId(destination.district_id);
            const existing = destinationsByDistrict.get(key) || [];
            existing.push(destination);
            destinationsByDistrict.set(key, existing);
        }

        const treksByDistrict = new Map();
        for (const trek of treksRes.rows) {
            const key = normalizeDistrictId(trek.district_id);
            const existing = treksByDistrict.get(key) || [];
            existing.push(trek);
            treksByDistrict.set(key, existing);
        }

        const data = districtsRes.rows.map((dist) => {
            const districtKey = normalizeDistrictId(dist.id);
            return {
                ...dist,
                description: dist.description || "",
                province: dist.province || "",
                slug: dist.slug || "",
                destinations: destinationsByDistrict.get(districtKey) || [],
                treks: treksByDistrict.get(districtKey) || [],
                stories: []
            };
        });


        res.json({ districts: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tourism data" });
    }
};

export const getStats = async (req, res) => {
    try {
        const [districts, destinations, treks, stories] = await Promise.all([
            pool.query("SELECT COUNT(*) as count FROM districts"),
            pool.query("SELECT COUNT(*) as count FROM destinations"),
            pool.query("SELECT COUNT(*) as count FROM treks"),
            pool.query("SELECT COUNT(*) as count FROM stories")
        ]);

        res.json({
            districts: parseInt(districts.rows[0].count),
            destinations: parseInt(destinations.rows[0].count),
            treks: parseInt(treks.rows[0].count),
            stories: parseInt(stories.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
};
