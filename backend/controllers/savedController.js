import pool from "../config/db.js";

export const saveItem = async (req, res) => {
  const { item_type, item_id } = req.body;
  const user_id = req.user.id;

  if (!item_type || !item_id) {
    return res.status(400).json({ error: "item_type and item_id are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO saved_items (user_id, item_type, item_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, item_type, item_id) DO NOTHING RETURNING *",
      [user_id, item_type, item_id]
    );
    res.status(201).json({ 
        message: "Item saved successfully", 
        savedItem: result.rows[0] || { user_id, item_type, item_id } 
    });
  } catch (err) {
    console.error("saveItem error:", err.message);
    res.status(500).json({ error: "Failed to save item" });
  }
};

export const removeSavedItem = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM saved_items WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Saved item not found or not authorized" });
    }

    res.json({ message: "Item removed from saved", removedItem: result.rows[0] });
  } catch (err) {
    console.error("removeSavedItem error:", err.message);
    res.status(500).json({ error: "Failed to remove saved item" });
  }
};

// Alternative remove by item details (useful for toggling from cards)
export const removeSavedItemByDetails = async (req, res) => {
    const { item_type, item_id } = req.body;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            "DELETE FROM saved_items WHERE user_id = $1 AND item_type = $2 AND item_id = $3 RETURNING *",
            [user_id, item_type, item_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Saved item not found" });
        }

        res.json({ message: "Item removed from saved", removedItem: result.rows[0] });
    } catch (err) {
        console.error("removeSavedItemByDetails error:", err.message);
        res.status(500).json({ error: "Failed to remove saved item" });
    }
};

export const getSavedItems = async (req, res) => {
  const user_id = req.user.id;

  try {
    const query = `
      SELECT 
        si.id,
        si.item_type,
        si.item_id,
        si.created_at,
        CASE 
          WHEN si.item_type = 'destination' THEN d.name
          WHEN si.item_type = 'trek' THEN t.name
          WHEN si.item_type = 'story' THEN s.title
          ELSE 'Unknown'
        END as title,
        CASE 
          WHEN si.item_type = 'destination' THEN d.image
          WHEN si.item_type = 'trek' THEN t.image
          WHEN si.item_type = 'story' THEN (SELECT media_url FROM story_media sm WHERE sm.story_id = s.id ORDER BY sm.id LIMIT 1)
          ELSE NULL
        END as image,
        CASE 
          WHEN si.item_type = 'destination' THEN dist_d.name
          WHEN si.item_type = 'trek' THEN dist_t.name
          WHEN si.item_type = 'story' THEN s.location_tag
          ELSE 'Nepal'
        END as district_name
      FROM saved_items si
      LEFT JOIN destinations d ON si.item_type = 'destination' AND (si.item_id ~ '^[0-9]+$' AND d.id = NULLIF(si.item_id, '')::INTEGER)
      LEFT JOIN treks t ON si.item_type = 'trek' AND (si.item_id ~ '^[0-9]+$' AND t.id = NULLIF(si.item_id, '')::INTEGER)
      LEFT JOIN stories s ON si.item_type = 'story' AND (si.item_id ~ '^[0-9]+$' AND s.id = NULLIF(si.item_id, '')::INTEGER)
      LEFT JOIN districts dist_d ON d.district_id = dist_d.id
      LEFT JOIN districts dist_t ON t.district_id = dist_t.id
      WHERE si.user_id = $1
      ORDER BY si.created_at DESC;
    `;
    const result = await pool.query(query, [user_id]);
    res.json({ savedItems: result.rows });
  } catch (err) {
    console.error("getSavedItems error:", err.message);
    res.status(500).json({ error: "Failed to fetch saved items" });
  }
};

export const checkSavedStatus = async (req, res) => {
  const { item_type, item_id } = req.query;
  const user_id = req.user.id;

  if (!item_type || !item_id) {
    return res.status(400).json({ error: "item_type and item_id are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id FROM saved_items WHERE user_id = $1 AND item_type = $2 AND item_id = $3",
      [user_id, item_type, item_id]
    );
    res.json({ isSaved: result.rows.length > 0, savedItemId: result.rows[0]?.id || null });
  } catch (err) {
    console.error("checkSavedStatus error:", err.message);
    res.status(500).json({ error: "Failed to check saved status" });
  }
};
