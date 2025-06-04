// routes/transaction.js
import express from 'express';

const router = express.Router();
import { addTransaction, getTransactions, deleteTransaction,getAllBudget, addBudget,getBudgets,deleteBudget } from '../controllers/transaction.controller.js';
import {protectRoute} from '../middleware/auth.middleware.js'

router.post('/add',protectRoute, addTransaction);
router.get('/gettransaction',protectRoute, getTransactions);
router.delete('/delete/:transactionId', protectRoute, deleteTransaction);
router.post('/addBudget',protectRoute,addBudget)
router.get('/getBudget',protectRoute,getBudgets);
router.delete('/deleteBudget/:budgetId', protectRoute,deleteBudget);
router.get('/getAllBudget',protectRoute,getAllBudget);


export default router;
