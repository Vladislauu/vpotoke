import {Router, urlencoded} from 'express';
import methodOverride from 'method-override';

const postRouter = Router();

postRouter.use(urlencoded({extended: true}));
postRouter.use(methodOverride('_method'));