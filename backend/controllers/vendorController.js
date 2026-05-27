import pool from "../config/db.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

let vendorListingsHasImageUrlsColumn = null;

const hasImageUrlsColumn = async () => {
    if (vendorListingsHasImageUrlsColumn !== null) {
        return vendorListingsHasImageUrlsColumn;
    }

    const result = await pool.query(`
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vendor_listings' AND column_name = 'image_urls'
        LIMIT 1
    `);

    vendorListingsHasImageUrlsColumn = result.rows.length > 0;
    return vendorListingsHasImageUrlsColumn;
};

const parseJsonArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return [];
        }
    }
    return [];
};

const parseAmenities = (amenities) => {
    if (!amenities) return "[]";
    if (typeof amenities === "string" && amenities.startsWith("[")) return amenities;
    if (typeof amenities === "string") {
        return JSON.stringify(amenities.split(",").map((s) => s.trim()).filter(Boolean));
    }
    return JSON.stringify(amenities);
};

// ==========================================
// VENDOR APPLICATION & PROFILE
// ==========================================

export const applyVendor = async (req, res) => {
    try {
        const userId = req.user.id;
        const { business_name, vendor_type, district_slug, description, phone, email, pan_number, registration_number } = req.body;

        // Validation
        if (!business_name || !vendor_type || !district_slug || !description || !phone || !email || !pan_number || !registration_number) {
            return res.status(400).json({ error: "All business and verification fields are required." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid business email address." });
        }

        // Check if user already applied
        const existing = await pool.query("SELECT id FROM vendors WHERE owner_user_id = $1", [userId]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "An application has already been submitted for this account." });
        }

        let document_url = null;
        let document_public_id = null;
        let image_url = null;

        // Handle file uploads (expecting 'document' and optionally 'image')
        if (!req.files || !req.files.find(f => f.fieldname === 'document')) {
            return res.status(400).json({ error: "An official registration document is required for verification." });
        }
            const docFile = req.files.find(f => f.fieldname === 'document');
            const imgFile = req.files.find(f => f.fieldname === 'image');

            if (docFile) {
                const docUpload = await uploadBufferToCloudinary({
                    buffer: docFile.buffer,
                    mimetype: docFile.mimetype,
                    folder: "echoes-vendors/docs"
                });
                document_url = docUpload.secure_url;
                document_public_id = docUpload.public_id;
            }

            if (imgFile) {
                const imgUpload = await uploadBufferToCloudinary({
                    buffer: imgFile.buffer,
                    mimetype: imgFile.mimetype,
                    folder: "echoes-vendors/images"
                });
                image_url = imgUpload.secure_url;
            }

            const insertQuery = `
                INSERT INTO vendors (owner_user_id, business_name, vendor_type, district_slug, description, phone, email, pan_number, registration_number, document_url, document_public_id, image_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
            `;
            const result = await pool.query(insertQuery, [userId, business_name, vendor_type, district_slug, description, phone, email, pan_number, registration_number, document_url, document_public_id, image_url]);

            // Change user role? Optional for now, since verification is pending.
            res.status(201).json({ message: "Vendor application submitted successfully.", vendor: result.rows[0] });
        } catch (err) {
            console.error("applyVendor error:", err);
            res.status(500).json({ error: err.message || "Failed to submit vendor application" });
        }
    };


export const getMyVendorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query("SELECT * FROM vendors WHERE owner_user_id = $1", [userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Vendor profile not found" });
        }
        res.json({ vendor: result.rows[0] });
    } catch (err) {
        console.error("getMyVendorProfile error:", err);
        res.status(500).json({ error: "Failed to load vendor profile" });
    }
};

// ==========================================
// VENDOR LISTINGS CRUD (Dashboard)
// ==========================================

export const addListing = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, listing_type, district_slug, destination_id, trek_id, description, price, rating, amenities } = req.body;
        const supportsImageGallery = await hasImageUrlsColumn();

        // Check verification
        const vendorRes = await pool.query("SELECT id, is_verified FROM vendors WHERE owner_user_id = $1", [userId]);
        if (vendorRes.rows.length === 0) {
            return res.status(404).json({ error: "Vendor profile not found." });
        }
        const vendor = vendorRes.rows[0];
        if (!vendor.is_verified) {
            return res.status(403).json({ error: "Your vendor account is not verified yet. You cannot add listings." });
        }

        const imageFiles = (req.files || []).filter((file) => file.fieldname === "images" || file.fieldname === "image");
        const uploadedImageUrls = [];
        for (const imageFile of imageFiles) {
            const imgUpload = await uploadBufferToCloudinary({
                buffer: imageFile.buffer,
                mimetype: imageFile.mimetype,
                folder: "echoes-listings"
            });
            uploadedImageUrls.push(imgUpload.secure_url);
        }
        const image_url = uploadedImageUrls[0] || null;

        const result = supportsImageGallery
            ? await pool.query(
                `
                INSERT INTO vendor_listings (vendor_id, title, listing_type, district_slug, destination_id, trek_id, description, price, image_url, image_urls, rating, amenities)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *
                `,
                [
                    vendor.id,
                    title,
                    listing_type,
                    district_slug || null,
                    destination_id || null,
                    trek_id || null,
                    description,
                    price,
                    image_url,
                    JSON.stringify(uploadedImageUrls),
                    rating ? parseFloat(rating) : 4.5,
                    parseAmenities(amenities)
                ]
            )
            : await pool.query(
                `
                INSERT INTO vendor_listings (vendor_id, title, listing_type, district_slug, destination_id, trek_id, description, price, image_url, rating, amenities)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
                `,
                [
                    vendor.id,
                    title,
                    listing_type,
                    district_slug || null,
                    destination_id || null,
                    trek_id || null,
                    description,
                    price,
                    image_url,
                    rating ? parseFloat(rating) : 4.5,
                    parseAmenities(amenities)
                ]
            );
        res.status(201).json({ message: "Listing added.", listing: result.rows[0] });
    } catch (err) {
        console.error("addListing error:", err);
        res.status(500).json({ error: "Failed to create listing" });
    }
};

export const updateListing = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, listing_type, district_slug, destination_id, trek_id, description, price, is_active, rating, amenities } = req.body;
        const supportsImageGallery = await hasImageUrlsColumn();

        const checkRes = await pool.query("SELECT l.id, l.vendor_id FROM vendor_listings l JOIN vendors v ON l.vendor_id = v.id WHERE l.id = $1 AND v.owner_user_id = $2", [id, userId]);
        if (checkRes.rows.length === 0) return res.status(403).json({ error: "Not allowed or not found" });

        const existingListingRes = supportsImageGallery
            ? await pool.query("SELECT image_url, image_urls FROM vendor_listings WHERE id = $1", [id])
            : await pool.query("SELECT image_url FROM vendor_listings WHERE id = $1", [id]);
        const existingListing = existingListingRes.rows[0] || {};
        const incomingExistingUrls = parseJsonArray(req.body.existing_image_urls);
        const currentImageUrls = incomingExistingUrls.length > 0
            ? incomingExistingUrls
            : supportsImageGallery
                ? parseJsonArray(existingListing.image_urls)
                : (existingListing.image_url ? [existingListing.image_url] : []);

        const imageFiles = (req.files || []).filter((file) => file.fieldname === "images" || file.fieldname === "image");
        const uploadedImageUrls = [];
        for (const imageFile of imageFiles) {
            const imgUpload = await uploadBufferToCloudinary({
                buffer: imageFile.buffer,
                mimetype: imageFile.mimetype,
                folder: "echoes-listings"
            });
            uploadedImageUrls.push(imgUpload.secure_url);
        }

        const nextImageUrls = [...currentImageUrls, ...uploadedImageUrls];
        const image_url = nextImageUrls[0] || existingListing.image_url || null;

        const result = supportsImageGallery
            ? await pool.query(
                `
                UPDATE vendor_listings 
                SET title = COALESCE($1, title),
                    listing_type = COALESCE($2, listing_type),
                    district_slug = COALESCE($3, district_slug),
                    destination_id = COALESCE($4, destination_id),
                    trek_id = COALESCE($5, trek_id),
                    description = COALESCE($6, description),
                    price = COALESCE($7, price),
                    image_url = COALESCE($8, image_url),
                    is_active = COALESCE($9, is_active),
                    rating = COALESCE($10, rating),
                    amenities = COALESCE($11, amenities),
                    image_urls = COALESCE($12, image_urls),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $13
                RETURNING *
                `,
                [
                    title,
                    listing_type,
                    district_slug || null,
                    destination_id ? parseInt(destination_id) : null,
                    trek_id ? parseInt(trek_id) : null,
                    description,
                    price,
                    image_url,
                    is_active,
                    rating ? parseFloat(rating) : null,
                    amenities ? parseAmenities(amenities) : null,
                    JSON.stringify(nextImageUrls),
                    id
                ]
            )
            : await pool.query(
                `
                UPDATE vendor_listings 
                SET title = COALESCE($1, title),
                    listing_type = COALESCE($2, listing_type),
                    district_slug = COALESCE($3, district_slug),
                    destination_id = COALESCE($4, destination_id),
                    trek_id = COALESCE($5, trek_id),
                    description = COALESCE($6, description),
                    price = COALESCE($7, price),
                    image_url = COALESCE($8, image_url),
                    is_active = COALESCE($9, is_active),
                    rating = COALESCE($10, rating),
                    amenities = COALESCE($11, amenities),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $12
                RETURNING *
                `,
                [
                    title,
                    listing_type,
                    district_slug || null,
                    destination_id ? parseInt(destination_id) : null,
                    trek_id ? parseInt(trek_id) : null,
                    description,
                    price,
                    image_url,
                    is_active,
                    rating ? parseFloat(rating) : null,
                    amenities ? parseAmenities(amenities) : null,
                    id
                ]
            );
        res.json({ message: "Listing updated.", listing: result.rows[0] });
    } catch (err) {
        console.error("updateListing error:", err);
        res.status(500).json({ error: "Failed to update listing" });
    }
};

export const deleteListing = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const checkRes = await pool.query("SELECT l.id FROM vendor_listings l JOIN vendors v ON l.vendor_id = v.id WHERE l.id = $1 AND v.owner_user_id = $2", [id, userId]);
        if (checkRes.rows.length === 0) return res.status(403).json({ error: "Not allowed or not found" });

        // Can optionally delete image from cloudinary here
        await pool.query("DELETE FROM vendor_listings WHERE id = $1", [id]);
        res.json({ message: "Listing deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete listing" });
    }
};

export const getMyListings = async (req, res) => {
    try {
        const userId = req.user.id;
        const vendorRes = await pool.query("SELECT id FROM vendors WHERE owner_user_id = $1", [userId]);
        if (vendorRes.rows.length === 0) return res.json({ listings: [] });

        const result = await pool.query("SELECT * FROM vendor_listings WHERE vendor_id = $1 ORDER BY created_at DESC", [vendorRes.rows[0].id]);
        res.json({ listings: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch listings" });
    }
};

// ==========================================
// PUBLIC BROWSE
// ==========================================

export const getPublicVendorsByDistrict = async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await pool.query(`
            SELECT l.*, v.business_name, v.phone, v.email
            FROM vendor_listings l
            JOIN vendors v ON l.vendor_id = v.id
            WHERE l.district_slug ILIKE $1 AND l.is_active = true AND v.is_verified = true
            ORDER BY l.created_at DESC
        `, [slug]);
        res.json({ listings: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed" });
    }
};

export const getPublicVendorsByDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT l.*, v.business_name, v.phone, v.email
            FROM vendor_listings l
            JOIN vendors v ON l.vendor_id = v.id
            WHERE l.destination_id = $1 AND l.is_active = true AND v.is_verified = true
            ORDER BY l.created_at DESC
        `, [id]);
        res.json({ listings: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed" });
    }
};

export const getPublicVendorsByTrek = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT l.*, v.business_name, v.phone, v.email
            FROM vendor_listings l
            JOIN vendors v ON l.vendor_id = v.id
            WHERE l.trek_id = $1 AND l.is_active = true AND v.is_verified = true
            ORDER BY l.created_at DESC
        `, [id]);
        res.json({ listings: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed" });
    }
};

export const getPublicListingById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT l.*, v.business_name, v.phone, v.email, v.description as vendor_desc, v.image_url as vendor_image
            FROM vendor_listings l
            JOIN vendors v ON l.vendor_id = v.id
            WHERE l.id = $1 AND l.is_active = true AND v.is_verified = true
        `, [id]);

        if (result.rows.length === 0) return res.status(404).json({ error: "Listing not found" });
        res.json({ listing: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Failed" });
    }
};

export const getAllPublicListings = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT l.*, v.business_name, v.phone, v.email, v.district_slug as vendor_district
            FROM vendor_listings l
            JOIN vendors v ON l.vendor_id = v.id
            WHERE l.is_active = true AND v.is_verified = true
            ORDER BY l.created_at DESC
        `);
        res.json({ listings: result.rows });
    } catch (err) {
        console.error("getAllPublicListings error:", err);
        res.status(500).json({ error: "Failed to fetch listings" });
    }
};

// ==========================================
// ADMIN BROWSE & APPROVE
// ==========================================

export const getAllVendors = async (req, res) => {
    try {
        const result = await pool.query("SELECT v.*, u.name as owner_name, u.email as owner_email FROM vendors v JOIN users u ON v.owner_user_id = u.id ORDER BY v.created_at DESC");
        res.json({ vendors: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch vendors" });
    }
};

export const approveVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE vendors SET is_verified = true, verification_status = 'approved', rejection_reason = null, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Vendor not found" });
        res.json({ message: "Vendor approved successfully", vendor: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Failed to approve vendor" });
    }
};

export const rejectVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const result = await pool.query(
            "UPDATE vendors SET is_verified = false, verification_status = 'rejected', rejection_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [reason || "Application did not meet requirements.", id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Vendor not found" });
        res.json({ message: "Vendor rejected", vendor: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Failed to reject vendor" });
    }
};
