import express from 'express';

const router = express.Router();

// Placeholder controller functions
const newsController = {
  getNews: (req, res) => res.json({ message: 'Get news endpoint' }),
  getNewsById: (req, res) => res.json({ message: 'Get news by ID endpoint' }),
};

router.get('/', newsController.getNews);
router.get('/:id', newsController.getNewsById);

export default router;
