import {Router, urlencoded} from 'express';
import methodOverride from 'method-override';

const userRouter = Router();

userRouter.use(urlencoded({extended: true}));
userRouter.use(methodOverride('_method'));