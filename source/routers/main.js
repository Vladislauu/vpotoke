import {Router, urlencoded} from 'express';
import methodOverride from 'method-override';

import authRouter from './source/routers/auth.js';
import userRouter from './source/routers/user.js';
import postRouter from './source/routers/post.js';
import postRouter from './source/routers/conv.js';

const mainRouter = Router();

mainRouter.use(urlencoded({extended: true}));
mainRouter.use(methodOverride('_method'));

mainRouter.use('auth/', authRouter);
mainRouter.use('user/', userRouter);
mainRouter.use('post/', postRouter);
mainRouter.use('conv/', convRouter);