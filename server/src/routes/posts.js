import { Router } from 'express';
import { createPost, deletePost, getFeed, getSinglePost } from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import { likePost, unlikePost } from '../controllers/like.controller.js';

const router = Router();

router.get('/feed', protect, getFeed);
router.get('/:id', getSinglePost);
router.post('/', protect, upload.single('image'), createPost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);

export default router;