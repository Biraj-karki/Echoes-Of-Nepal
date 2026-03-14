// backend/controllers/storyController.js
import pool from "../config/db.js";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

/**
 * ✅ Map helper: location_tag -> {lat, lng, display_name}
 * Uses OpenStreetMap Nominatim (free).
 * NOTE: Must send a User-Agent.
 */
async function geocodeLocationTag(locationTag) {
  const q = (locationTag || "").trim();
  if (!q) return { lat: null, lng: null, display_name: null };

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", q);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "EchoesOfNepal/1.0 (contact: you@example.com)",
        "Accept-Language": "en",
      },
    });

    if (!res.ok) return { lat: null, lng: null, display_name: null };

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return { lat: null, lng: null, display_name: null };
    }

    const first = data[0];
    return {
      lat: first.lat ? Number(first.lat) : null,
      lng: first.lon ? Number(first.lon) : null,
      display_name: first.display_name || null,
    };
  } catch (e) {
    return { lat: null, lng: null, display_name: null };
  }
}

export const getAllStories = async (req, res) => {
  try {
    const userId = req.user?.id || null;

    const result = await pool.query(
      `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.location_tag,
        s.created_at,
        s.lat,
        s.lng,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,

        -- counts
        (SELECT COUNT(*)::int FROM story_likes sl WHERE sl.story_id = s.id) AS like_count,
        (SELECT COUNT(*)::int FROM story_comments sc WHERE sc.story_id = s.id) AS comment_count,

        -- liked by me (if logged in)
        CASE 
          WHEN $1::int IS NULL THEN false
          ELSE EXISTS(
            SELECT 1 FROM story_likes sl 
            WHERE sl.story_id = s.id AND sl.user_id = $1
          )
        END AS liked_by_me,

        COALESCE(
          json_agg(
            json_build_object(
              'id', sm.id,
              'media_url', sm.media_url,
              'media_type', sm.media_type
            )
          ) FILTER (WHERE sm.id IS NOT NULL),
          '[]'
        ) AS media

      FROM stories s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN story_media sm ON sm.story_id = s.id
      GROUP BY s.id, u.id
      ORDER BY s.created_at DESC
      `,
      [userId]
    );

    res.json({ stories: result.rows });
  } catch (err) {
    console.error("getAllStories error:", err.message);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
};

export const getMyStories = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT 
        s.id,
        s.title,
        s.description,
        s.location_tag,
        s.created_at,
        s.lat,
        s.lng,

        (SELECT COUNT(*)::int FROM story_likes sl WHERE sl.story_id = s.id) AS like_count,

        COALESCE(
          json_agg(
            json_build_object(
              'id', sm.id,
              'media_url', sm.media_url,
              'media_type', sm.media_type
            )
          ) FILTER (WHERE sm.id IS NOT NULL),
          '[]'
        ) AS media
      FROM stories s
      LEFT JOIN story_media sm ON sm.story_id = s.id
      WHERE s.user_id = $1
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `,
      [userId]
    );

    res.json({ stories: result.rows });
  } catch (err) {
    console.error("getMyStories error:", err.message);
    res.status(500).json({ error: "Failed to fetch your stories" });
  }
};

export const createStory = async (req, res) => {
  const { title, description, location_tag } = req.body;

  try {
    if (!title) return res.status(400).json({ error: "Title is required" });

    const userId = req.user.id;

    // ✅ NEW: auto geocode location_tag -> lat/lng
    const geo = await geocodeLocationTag(location_tag);
    const lat = geo.lat;
    const lng = geo.lng;

    const storyInsert = await pool.query(
      `
      INSERT INTO stories (user_id, title, description, location_tag, lat, lng)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, description, location_tag, lat, lng, created_at
      `,
      [userId, title, description || "", location_tag || "", lat, lng]
    );

    const story = storyInsert.rows[0];

    const files = req.files || [];
    for (const f of files) {
      const mediaType = f.mimetype.startsWith("video") ? "video" : "image";

      const uploadResult = await uploadBufferToCloudinary({
        buffer: f.buffer, // Buffer from multer memoryStorage
        mimetype: f.mimetype,
        folder: process.env.CLOUDINARY_FOLDER || "echoes-of-nepal",
      });

      await pool.query(
        `
        INSERT INTO story_media (story_id, media_url, media_type, public_id)
        VALUES ($1, $2, $3, $4)
        `,
        [story.id, uploadResult.secure_url, mediaType, uploadResult.public_id]
      );
    }

    res.status(201).json({
      story_id: story.id,
      message: "Story created",
      lat: story.lat,
      lng: story.lng,
      resolved_place: geo.display_name,
    });
  } catch (err) {
    console.error("createStory error:", err);
    res.status(500).json({ error: "Failed to create story" });
  }
};

/**
 * ✅ NEW: markers endpoint (for map)
 * GET /api/stories/markers
 */
export const getStoryMarkers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.id,
        s.title,
        s.location_tag,
        s.lat,
        s.lng,
        s.created_at,
        u.name as user_name
      FROM stories s
      JOIN users u ON u.id = s.user_id
      WHERE s.lat IS NOT NULL AND s.lng IS NOT NULL
      ORDER BY s.created_at DESC
    `);

    res.json({ markers: result.rows });
  } catch (err) {
    console.error("getStoryMarkers error:", err.message);
    res.status(500).json({ error: "Failed to fetch markers" });
  }
};

/**
 * DELETE /api/stories/:id
 * Only story owner can delete.
 * Deletes Cloudinary assets first, then DB.
 */
export const deleteStory = async (req, res) => {
  const storyId = Number(req.params.id);
  const userId = req.user.id;

  try {
    // Check ownership
    const storyRes = await pool.query(
      "SELECT id, user_id FROM stories WHERE id = $1",
      [storyId]
    );
    if (storyRes.rows.length === 0) {
      return res.status(404).json({ error: "Story not found" });
    }
    if (storyRes.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Not allowed to delete this story" });
    }

    // Get media rows
    const mediaRes = await pool.query(
      "SELECT id, public_id, media_type FROM story_media WHERE story_id = $1",
      [storyId]
    );

    // Delete from Cloudinary (best effort)
    await Promise.allSettled(
      mediaRes.rows.map((m) =>
        deleteFromCloudinary({ public_id: m.public_id, media_type: m.media_type })
      )
    );

    // Delete DB rows in transaction
    await pool.query("BEGIN");
    await pool.query("DELETE FROM story_media WHERE story_id = $1", [storyId]);

    // If you later add likes/comments tables:
    // await pool.query("DELETE FROM story_likes WHERE story_id = $1", [storyId]);
    // await pool.query("DELETE FROM story_comments WHERE story_id = $1", [storyId]);

    await pool.query("DELETE FROM stories WHERE id = $1", [storyId]);
    await pool.query("COMMIT");

    res.json({ message: "Story deleted successfully" });
  } catch (err) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("deleteStory error:", err);
    res.status(500).json({ error: "Failed to delete story" });
  }
};

/**
 * DELETE /api/stories/:storyId/media/:mediaId
 * Delete only one media item from a story (owner only)
 */
export const deleteStoryMedia = async (req, res) => {
  const storyId = Number(req.params.storyId);
  const mediaId = Number(req.params.mediaId);
  const userId = req.user.id;

  try {
    // Check ownership
    const storyRes = await pool.query(
      "SELECT id, user_id FROM stories WHERE id = $1",
      [storyId]
    );
    if (storyRes.rows.length === 0) {
      return res.status(404).json({ error: "Story not found" });
    }
    if (storyRes.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const mediaRes = await pool.query(
      "SELECT id, public_id, media_type FROM story_media WHERE id = $1 AND story_id = $2",
      [mediaId, storyId]
    );
    if (mediaRes.rows.length === 0) {
      return res.status(404).json({ error: "Media not found" });
    }

    const media = mediaRes.rows[0];

    await deleteFromCloudinary({
      public_id: media.public_id,
      media_type: media.media_type,
    });
    await pool.query("DELETE FROM story_media WHERE id = $1", [mediaId]);

    res.json({ message: "Media deleted successfully" });
  } catch (err) {
    console.error("deleteStoryMedia error:", err);
    res.status(500).json({ error: "Failed to delete media" });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const storyId = Number(req.params.id);
    const userId = req.user.id;

    // already liked?
    const existing = await pool.query(
      "SELECT 1 FROM story_likes WHERE story_id=$1 AND user_id=$2",
      [storyId, userId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        "DELETE FROM story_likes WHERE story_id=$1 AND user_id=$2",
        [storyId, userId]
      );
      return res.json({ liked: false });
    }

    await pool.query(
      "INSERT INTO story_likes (story_id, user_id) VALUES ($1, $2)",
      [storyId, userId]
    );

    res.json({ liked: true });
  } catch (err) {
    console.error("toggleLike error:", err.message);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

export const getComments = async (req, res) => {
  try {
    const storyId = Number(req.params.id);

    const result = await pool.query(
      `
      SELECT 
        sc.id,
        sc.text,
        sc.created_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email
      FROM story_comments sc
      JOIN users u ON u.id = sc.user_id
      WHERE sc.story_id = $1
      ORDER BY sc.created_at ASC
      `,
      [storyId]
    );

    res.json({ comments: result.rows });
  } catch (err) {
    console.error("getComments error:", err.message);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

export const addComment = async (req, res) => {
  try {
    const storyId = Number(req.params.id);
    const userId = req.user.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment text required" });
    }

    const inserted = await pool.query(
      `
      INSERT INTO story_comments (story_id, user_id, text)
      VALUES ($1, $2, $3)
      RETURNING id, text, created_at
      `,
      [storyId, userId, text.trim()]
    );

    res.status(201).json({ comment: inserted.rows[0] });
  } catch (err) {
    console.error("addComment error:", err.message);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const storyId = Number(req.params.id);
    const commentId = Number(req.params.commentId);
    const userId = req.user.id;

    // allow comment author OR story owner
    const check = await pool.query(
      `
      SELECT 
        sc.user_id AS comment_user_id,
        s.user_id AS story_owner_id
      FROM story_comments sc
      JOIN stories s ON s.id = sc.story_id
      WHERE sc.id=$1 AND sc.story_id=$2
      `,
      [commentId, storyId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const { comment_user_id, story_owner_id } = check.rows[0];
    if (
      Number(comment_user_id) !== Number(userId) &&
      Number(story_owner_id) !== Number(userId)
    ) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await pool.query("DELETE FROM story_comments WHERE id=$1 AND story_id=$2", [
      commentId,
      storyId,
    ]);

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("deleteComment error:", err.message);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

export const getMyLikedStoryIds = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT story_id FROM story_likes WHERE user_id = $1",
      [userId]
    );
    res.json({ liked_story_ids: result.rows.map((r) => r.story_id) });
  } catch (err) {
    console.error("getMyLikedStoryIds error:", err.message);
    res.status(500).json({ error: "Failed to fetch likes" });
  }
};
