import {Router, urlencoded} from 'express';
import {
  show,
  createPost,
  addFriend,
  removeFriend,
  me
} from '../controllers/userController.js';

const userRouter = Router();


userRouter.get('/me', me);

userRouter.get('/:id', show);


userRouter.post('/:id/post', createPost);


userRouter.post('/:id/friend',   addFriend);
userRouter.post('/:id/unfriend', removeFriend);

export default userRouter;