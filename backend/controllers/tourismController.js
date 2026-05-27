import pool from "../config/db.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// --- Districts ---
export const getAllDistricts = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM districts ORDER BY name ASC");
        res.json({ districts: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch districts" });
    }
};

export const updateDistrict = async (req, res) => {
    const { id } = req.params;
    const { description, highlights, province } = req.body;
    let banner_image = req.body.banner_image;

    try {
        if (req.file) {
            const upload = await uploadBufferToCloudinary({
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
                folder: "districts"
            });
            banner_image = upload.secure_url;
        }

        await pool.query(
            "UPDATE districts SET description = $1, banner_image = $2, highlights = $3, province = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5",
            [description, banner_image, highlights, province, id]
        );
        res.json({ message: "District updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update district" });
    }
};


// --- Destinations ---
export const getAllDestinations = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, dist.name as district_name 
            FROM destinations d
            JOIN districts dist ON dist.id = d.district_id
            ORDER BY d.created_at DESC
        `);
        res.json({ destinations: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch destinations" });
    }
};
export const addDestination = async (req, res) => {
    const { district_id, name, category, description, rating, lat, lng, featured, highlights, best_time, best_season, things_to_do, activities, tips, how_to_reach, entry_fee } = req.body;
    let image = req.body.image;

    if (req.file) {
        try {
            const upload = await uploadBufferToCloudinary({
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
                folder: "destinations"
            });
            image = upload.secure_url;
        } catch (uploadError) {
            console.error("Cloudinary Upload Error:", uploadError);
            return res.status(500).json({ error: "Failed to upload image" });
        }
    }

    const parseArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [val];
            } catch (e) {
                return val.split(",").map(s => s.trim()).filter(Boolean);
            }
        }
        return [val];
    };

    const finalBestTime = best_time || best_season;
    const finalThingsToDo = things_to_do || activities;

    try {
        const result = await pool.query(
            "INSERT INTO destinations (district_id, name, category, image, description, rating, lat, lng, featured, highlights, best_time, things_to_do, tips, how_to_reach, entry_fee) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
            [
                district_id, 
                name, 
                category, 
                image, 
                description, 
                rating || 4.5, 
                lat || 27.7, 
                lng || 85.3, 
                featured === 'true' || featured === true, 
                JSON.stringify(parseArray(highlights)), 
                finalBestTime, 
                JSON.stringify(parseArray(finalThingsToDo)), 
                JSON.stringify(parseArray(tips)), 
                how_to_reach, 
                entry_fee
            ]
        );
        res.status(201).json({ message: "Destination added", destination: result.rows[0] });
    } catch (error) {
        console.error("Add Destination Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateDestination = async (req, res) => {
    const { id } = req.params;
    const { district_id, name, category, description, rating, lat, lng, featured, highlights, best_time, best_season, things_to_do, activities, tips, how_to_reach, entry_fee } = req.body;
    let image = req.body.image;

    if (req.file) {
        try {
            const upload = await uploadBufferToCloudinary({
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
                folder: "destinations"
            });
            image = upload.secure_url;
        } catch (uploadError) {
            console.error("Cloudinary Upload Error:", uploadError);
            return res.status(500).json({ error: "Failed to upload image" });
        }
    }

    const parseArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [val];
            } catch (e) {
                return val.split(",").map(s => s.trim()).filter(Boolean);
            }
        }
        return [val];
    };

    const finalBestTime = best_time || best_season;
    const finalThingsToDo = things_to_do || activities;

    try {
        const result = await pool.query(
            `UPDATE destinations SET 
            district_id = $1, name = $2, category = $3, image = $4, description = $5, 
            rating = $6, lat = $7, lng = $8, featured = $9, highlights = $10, 
            best_time = $11, things_to_do = $12, tips = $13, how_to_reach = $14, entry_fee = $15 
            WHERE id = $16 RETURNING *`,
            [
                district_id, 
                name, 
                category, 
                image, 
                description, 
                rating, 
                lat, 
                lng, 
                featured === 'true' || featured === true, 
                JSON.stringify(parseArray(highlights)), 
                finalBestTime, 
                JSON.stringify(parseArray(finalThingsToDo)), 
                JSON.stringify(parseArray(tips)), 
                how_to_reach, 
                entry_fee,
                id
            ]
        );
        res.json({ message: "Destination updated", destination: result.rows[0] });
    } catch (error) {
        console.error("Update Destination Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getDestinationById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT d.*, dist.name as district_name 
            FROM destinations d
            JOIN districts dist ON dist.id = d.district_id
            WHERE d.id = $1
        `, [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: "Destination not found" });
        res.json({ destination: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch destination" });
    }
};

export const deleteDestination = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM destinations WHERE id = $1", [id]);
        res.json({ message: "Destination deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete destination" });
    }
};

// --- Treks ---
export const getAllTreks = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.*, dist.name as district_name 
            FROM treks t
            JOIN districts dist ON dist.id = t.district_id
            ORDER BY t.created_at DESC
        `);
        res.json({ treks: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch treks" });
    }
};

export const addTrek = async (req, res) => {
    const { district_id, name, difficulty, duration, altitude, description, featured, highlights, best_time, best_season, activities, route } = req.body;
    let image = req.body.image;

    if (req.file) {
        try {
            const upload = await uploadBufferToCloudinary({
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
                folder: "treks"
            });
            image = upload.secure_url;
        } catch (uploadError) {
            console.error("Cloudinary Upload Error:", uploadError);
            return res.status(500).json({ error: "Failed to upload image" });
        }
    }

    const parseArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [val];
            } catch (e) {
                return val.split(",").map(s => s.trim()).filter(Boolean);
            }
        }
        return [val];
    };

    const finalBestTime = best_time || best_season;

    try {
        const result = await pool.query(
            "INSERT INTO treks (district_id, name, difficulty, duration, altitude, image, description, featured, highlights, best_time, activities, route) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
            [
                district_id, 
                name, 
                difficulty || 'Moderate', 
                duration, 
                altitude, 
                image, 
                description, 
                featured === 'true' || featured === true, 
                JSON.stringify(parseArray(highlights)), 
                finalBestTime, 
                JSON.stringify(parseArray(activities)), 
                route
            ]
        );
        res.status(201).json({ message: "Trek added", trek: result.rows[0] });
    } catch (error) {
        console.error("Add Trek Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateTrek = async (req, res) => {
    const { id } = req.params;
    const { district_id, name, difficulty, duration, altitude, description, featured, highlights, best_time, best_season, activities, route } = req.body;
    let image = req.body.image;

    if (req.file) {
        try {
            const upload = await uploadBufferToCloudinary({
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
                folder: "treks"
            });
            image = upload.secure_url;
        } catch (uploadError) {
            console.error("Cloudinary Upload Error:", uploadError);
            return res.status(500).json({ error: "Failed to upload image" });
        }
    }

    const parseArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === "string") {
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [val];
            } catch (e) {
                return val.split(",").map(s => s.trim()).filter(Boolean);
            }
        }
        return [val];
    };

    const finalBestTime = best_time || best_season;

    try {
        const result = await pool.query(
            `UPDATE treks SET district_id = $1, name = $2, difficulty = $3, duration = $4, altitude = $5, image = $6, description = $7, featured = $8, highlights = $9, best_time = $10, activities = $11, route = $12 WHERE id = $13 RETURNING *`,
            [
                district_id, 
                name, 
                difficulty, 
                duration, 
                altitude, 
                image, 
                description, 
                featured === 'true' || featured === true, 
                JSON.stringify(parseArray(highlights)), 
                finalBestTime, 
                JSON.stringify(parseArray(activities)), 
                route, 
                id
            ]
        );
        res.json({ message: "Trek updated", trek: result.rows[0] });
    } catch (error) {
        console.error("Update Trek Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getTrekById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT t.*, dist.name as district_name 
            FROM treks t
            JOIN districts dist ON dist.id = t.district_id
            WHERE t.id = $1
        `, [id]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: "Trek not found" });
        res.json({ trek: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch trek" });
    }
};

export const deleteTrek = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM treks WHERE id = $1", [id]);
        res.json({ message: "Trek deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete trek" });
    }
};

/**
 * GET /api/tourism/search?q=<query>
 * Case-insensitive search across districts and destinations.
 * Returns unified results with type, id, name, and coordinates (if any).
 * No backend changes needed for distance — that is computed on the frontend.
 */
export const searchLocations = async (req, res) => {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 1) {
        return res.json({ results: [] });
    }

    const pattern = `%${q}%`;

    try {
        const [districtsRes, destinationsRes] = await Promise.all([
            pool.query(
                `SELECT id, name, province, 'district' AS type, NULL AS lat, NULL AS lng
                 FROM districts
                 WHERE name ILIKE $1
                 ORDER BY name ASC
                 LIMIT 10`,
                [pattern]
            ),
            pool.query(
                `SELECT d.id, d.name, d.category, 'destination' AS type, d.lat, d.lng,
                        dist.name AS district_name
                 FROM destinations d
                 JOIN districts dist ON dist.id = d.district_id
                 WHERE d.name ILIKE $1
                 ORDER BY d.name ASC
                 LIMIT 10`,
                [pattern]
            )
        ]);

        const districts = districtsRes.rows.map(r => ({
            id: r.id,
            name: r.name,
            type: "district",
            subtitle: r.province || "Nepal",
            lat: null,
            lng: null,
        }));

        const destinations = destinationsRes.rows.map(r => ({
            id: r.id,
            name: r.name,
            type: "destination",
            subtitle: r.district_name ? `${r.category || "Destination"} · ${r.district_name}` : (r.category || "Destination"),
            lat: r.lat ? parseFloat(r.lat) : null,
            lng: r.lng ? parseFloat(r.lng) : null,
        }));

        // Interleave: districts first, then destinations, capped at 12 total
        const results = [...districts, ...destinations].slice(0, 12);
        res.json({ results });
    } catch (err) {
        console.error("searchLocations error:", err.message);
        res.status(500).json({ error: "Search failed" });
    }
};

export const getTrekItinerary = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT * FROM trek_itineraries WHERE trek_id = $1 ORDER BY day_number ASC",
            [id]
        );
        res.json({ itinerary: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch itinerary" });
    }
};

export const saveTrekItinerary = async (req, res) => {
    const { id } = req.params;
    const { itinerary } = req.body;
    
    if (!Array.isArray(itinerary)) {
        return res.status(400).json({ error: "Itinerary must be an array" });
    }
    
    try {
        await pool.query("BEGIN");
        await pool.query("DELETE FROM trek_itineraries WHERE trek_id = $1", [id]);
        
        for (const item of itinerary) {
            await pool.query(
                `INSERT INTO trek_itineraries (trek_id, day_number, title, description, distance, altitude, duration) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    id,
                    parseInt(item.day_number || item.day || "1"),
                    item.title || "",
                    item.description || item.desc || "",
                    item.distance || item.dist || "",
                    item.altitude || item.alt || "",
                    item.duration || item.dur || ""
                ]
            );
        }
        
        await pool.query("COMMIT");
        res.json({ message: "Itinerary saved successfully" });
    } catch (err) {
        await pool.query("ROLLBACK");
        console.error("Save itinerary error:", err);
        res.status(500).json({ error: "Failed to save itinerary" });
    }
};
