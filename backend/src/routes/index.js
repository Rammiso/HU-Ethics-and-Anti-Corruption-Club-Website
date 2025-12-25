import express from 'express';
import authRoutes from './authRoutes.js';
import reportsRoutes from './reportsRoutes.js';
import eventsRoutes from './eventsRoutes.js';
import newsRoutes from './newsRoutes.js';
import contactRoutes from './contactRoutes.js';
import adminRoutes from './adminRoutes.js';
import publicRoutes from './publicRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/reports', reportsRoutes);
router.use('/events', eventsRoutes);
router.use('/news', newsRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);

export default router;
