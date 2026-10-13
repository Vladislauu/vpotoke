import {Router, urlencoded} from 'express';
import { show, addFriend, me } from '../controllers/userController.js';
import methodOverride from 'method-override';

const userRouter = Router();

userRouter.get('/me', me);
userRouter.get('/:id', show);
userRouter.post('/:id/friend', addFriend);

export default userRouter;