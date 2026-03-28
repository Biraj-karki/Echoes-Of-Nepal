import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
    saveItem, 
    removeSavedItem, 
    removeSavedItemByDetails,
    getSavedItems, 
    checkSavedStatus 
} from "../controllers/savedController.js";

const router = express.Router();

router.use(protect); // All saved items routes are protected

router.post("/", saveItem);
router.delete("/:id", removeSavedItem);
router.delete("/", removeSavedItemByDetails); // For toggling from cards
router.get("/", getSavedItems);
router.get("/check", checkSavedStatus);

export default router;
