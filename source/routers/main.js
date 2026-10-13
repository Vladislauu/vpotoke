import {Router, urlencoded} from 'express';
import methodOverride from 'method-override';

import authRouter from './auth.js';
import userRouter from './user.js';
import postRouter from './post.js';
import convRouter from './conv.js';

import { feed } from '../controllers/postController.js';

const mainRouter = Router();

mainRouter.use('/auth', authRouter);
mainRouter.use('/user', userRouter);
mainRouter.use('/post', postRouter);
mainRouter.use('/conv', convRouter);

mainRouter.get('/', feed);

export default mainRouter;