import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controllers.js"
import { verifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJwt);

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router