import {Router, urlencoded} from 'express';
import methodOverride from 'method-override';

const authRouter = Router();

authRouter.use(urlencoded({extended: true}));
authRouter.use(methodOverride('_method'));