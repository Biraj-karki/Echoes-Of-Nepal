// backend/controllers/userController.js
import pool from "../config/db.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../models/userModel.js";

export async function getUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch actual counts from DB
    const storyCountRes = await pool.query("SELECT COUNT(*)::int FROM stories WHERE user_id = $1", [userId]);
    const likeCountRes = await pool.query("SELECT COUNT(*)::int FROM story_likes WHERE user_id = $1", [userId]);
    // savedDestinations and messages can be added later as those features expand

    const profileData = {
      id: user.id,
      name: user.name,
      username: user.email ? user.email.split('@')[0] : `user${user.id}`,
      email: user.email,
      bio: user.bio || "",
      profileImage: user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=200`,
      location: user.location || "Nepal",
      joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "January 2026",
      stats: {
        storiesUploaded: storyCountRes.rows[0].count,
        savedDestinations: 0, 
        messages: 0,
        placesExplored: 0 
      }
    };

    res.json(profileData);
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ message: "Error fetching user profile" });
  }
}

export async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, bio, location } = req.body;
    
    const updatedUser = await pool.query(
      "UPDATE users SET name = $1, bio = $2, location = $3 WHERE id = $4 RETURNING *",
      [name, bio, location, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser.rows[0] });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: "Error updating profile" });
  }
}

export async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    
    // Get current user to check for old profile image
    const userRes = await pool.query("SELECT profile_image FROM users WHERE id = $1", [userId]);
    const oldImage = userRes.rows[0]?.profile_image;

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      folder: "avatars",
    });

    // Update User in DB
    await pool.query(
      "UPDATE users SET profile_image = $1 WHERE id = $2",
      [result.secure_url, userId]
    );

    // Optional: Delete old image from Cloudinary if it exists and is a Cloudinary URL
    if (oldImage && oldImage.includes("cloudinary")) {
      // Need public_id. In a real app we'd store it, but for now we'll just leave it or extract from URL
      // Extraction logic: https://res.cloudinary.com/demo/image/upload/v1570977811/avatars/abc.jpg -> avatars/abc
      const parts = oldImage.split("/");
      const lastPart = parts[parts.length - 1].split(".")[0];
      const folderPart = parts[parts.length - 2];
      const public_id = `${folderPart}/${lastPart}`;
      await deleteFromCloudinary({ public_id, media_type: "image" });
    }

    res.json({ 
      message: "Avatar updated successfully", 
      profileImage: result.secure_url 
    });
  } catch (err) {
    console.error("Avatar upload error:", err.message);
    res.status(500).json({ message: "Error uploading avatar" });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getUser(req, res) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function addUser(req, res) {
  const { name, email } = req.body;
  try {
    const user = await createUser(name, email);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function editUser(req, res) {
  const { name, email } = req.body;
  try {
    const user = await updateUser(req.params.id, name, email);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function removeUser(req, res) {
  try {
    const user = await deleteUser(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
