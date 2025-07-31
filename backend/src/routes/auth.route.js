import express from 'express';
import {signup,login,logout,checkAuth,changePassword} from '../controllers/auth.controller.js'
import {protectRoute} from '../middleware/auth.middleware.js'

const router = express.Router();

router.post('/signup',signup)

router.post('/login',login)

router.post('/logout',logout)

router.get('/check',protectRoute,checkAuth);

router.post('/change-password',protectRoute,changePassword);



export default router;