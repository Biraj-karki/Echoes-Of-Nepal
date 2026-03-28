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
    const { district_id, name, category, description, rating, lat, lng, featured } = req.body;
    let image = "";

    try {
        if (req.file) {
            const upload = await uploadBufferToCloudinary({
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
                folder: "destinations"
            });
            image = upload.secure_url;
        }

        const result = await pool.query(
            "INSERT INTO destinations (district_id, name, category, image, description, rating, lat, lng, featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            [district_id, name, category, image, description, rating, lat, lng, featured]
        );
        res.status(201).json({ destination: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add destination" });
    }
};

export const updateDestination = async (req, res) => {
    const { id } = req.params;
    const { district_id, name, category, description, rating, lat, lng, featured } = req.body;
    let image = req.body.image;

    try {
        if (req.file) {
            const upload = await uploadBufferToCloudinary({
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
                folder: "destinations"
            });
            image = upload.secure_url;
        }

        await pool.query(
            "UPDATE destinations SET district_id = $1, name = $2, category = $3, image = $4, description = $5, rating = $6, lat = $7, lng = $8, featured = $9 WHERE id = $10",
            [district_id, name, category, image, description, rating, lat, lng, featured, id]
        );
        res.json({ message: "Destination updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update destination" });
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
    const { district_id, name, difficulty, duration, altitude, description, featured } = req.body;
    let image = "";

    try {
        if (req.file) {
            const upload = await uploadBufferToCloudinary({
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
                folder: "treks"
            });
            image = upload.secure_url;
        }

        const result = await pool.query(
            "INSERT INTO treks (district_id, name, difficulty, duration, altitude, description, featured) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [district_id, name, difficulty, duration, altitude, description, featured]
        );
        res.status(201).json({ trek: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Failed to add trek" });
    }
};

export const updateTrek = async (req, res) => {
    const { id } = req.params;
    const { district_id, name, difficulty, duration, altitude, description, featured } = req.body;
    let image = req.body.image;

    try {
        if (req.file) {
            const upload = await uploadBufferToCloudinary({
                buffer: req.file.buffer,
                mimetype: req.file.mimetype,
                folder: "treks"
            });
            image = upload.secure_url;
        }

        await pool.query(
            "UPDATE treks SET district_id = $1, name = $2, difficulty = $3, duration = $4, altitude = $5, description = $6, featured = $7, image = $8 WHERE id = $9",
            [district_id, name, difficulty, duration, altitude, description, featured, image, id]
        );
        res.json({ message: "Trek updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update trek" });
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
