import express from 'express';
import { fetchEmails } from '../controllers/gmailController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to fetch emails, requires user to be authenticated
router.post('/fetch', authMiddleware, fetchEmails);

export default router;
