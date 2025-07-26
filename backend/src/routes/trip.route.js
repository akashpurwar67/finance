import express from 'express';
import { createTrip,fetchTrips,fetchTripById,addExpenseToTrip,deleteTrip,uploadStatement } from '../controllers/trip.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
router.post('/createtrip', protectRoute, createTrip);
router.get('/fetchtrip', protectRoute,fetchTrips);
router.get('/fetchtripbyid/:id', protectRoute, fetchTripById);
router.post('/addexpense/:id', protectRoute, addExpenseToTrip);
router.delete('/deletetrip/:id', protectRoute, deleteTrip);
router.post('/upload', protectRoute, upload.single('pdf'),uploadStatement);




export default router;