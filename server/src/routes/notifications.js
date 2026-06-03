import { Router } from 'express';
import { getNotifications, markAllRead } from '../controllers/notification.controller';
const router = Router();

router.get('/', getNotifications)
router.get('/markRead', markAllRead)

export default router;