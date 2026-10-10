import {Router, urlencoded} from 'express';
import methodOverride from 'method-override';

const convRouter = Router();

convRouter.use(urlencoded({extended: true}));
convRouter.use(methodOverride('_method'));