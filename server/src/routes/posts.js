import { Router } from 'express';
import { createPost, deletePost, getFeed, getSinglePost } from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import { likePost, unlikePost } from '../controllers/like.controller.js';
import { addComment, deleteComment, getComments } from '../controllers/comment.controller.js';

const router = Router();

router.get('/feed', protect, getFeed);
router.get('/:id', getSinglePost);
router.post('/', protect, upload.single('image'), createPost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);

router.post("/:id/comment", protect, addComment)
router.delete('/comments/:commentId', protect, deleteComment)
router.get('/:id/comments', getComments);

export default router;