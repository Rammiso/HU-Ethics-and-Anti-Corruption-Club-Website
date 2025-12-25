import express from 'express';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Placeholder controller functions
const reportsController = {
  submitReport: (req, res) => res.json({ message: 'Submit report endpoint' }),
  trackReport: (req, res) => res.json({ message: 'Track report endpoint' }),
  uploadEvidence: (req, res) => res.json({ message: 'Upload evidence endpoint' }),
};

router.post('/', upload.array('evidence', 5), reportsController.submitReport);
router.get('/track/:trackingId', reportsController.trackReport);
router.post('/:trackingId/evidence', upload.array('evidence', 5), reportsController.uploadEvidence);

export default router;
