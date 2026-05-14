import express from "express";
import { getPublicTourismData } from "../controllers/publicTourismController.js";
import { 
    getAllDestinations, 
    getAllTreks, 
    getDestinationById, 
    getTrekById,
    getTrekItinerary,
    searchLocations
} from "../controllers/tourismController.js";

const router = express.Router();

router.get("/districts", getPublicTourismData);
router.get("/destinations", getAllDestinations);
router.get("/destinations/:id", getDestinationById);
router.get("/treks", getAllTreks);
router.get("/treks/:id", getTrekById);
router.get("/treks/:id/itinerary", getTrekItinerary);

// Location autocomplete — GET /api/tourism/search?q=mustang
router.get("/search", searchLocations);

export default router;
