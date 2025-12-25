import express from 'express';

const router = express.Router();

// Placeholder controller functions
const contactController = {
  submitMessage: (req, res) => res.json({ message: 'Submit contact message endpoint' }),
};

router.post('/', contactController.submitMessage);

export default router;
