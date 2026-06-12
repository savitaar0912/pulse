import { Router } from 'express';
import { getProfile, editProfile, getUserPosts, searchUsers } from '../controllers/user.controller.js';
import { followUser, unfollowUser } from '../controllers/follow.controller.js';
import { optionalProtect, protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

router.get('/search', searchUsers);                              // no auth — public
router.get('/:username', optionalProtect, getProfile);                           // no auth — public
router.put('/me', protect, upload.single('image'), editProfile);
router.get('/:id/posts', optionalProtect, getUserPosts);                         // optional auth — set req.userId when available
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

export default router;