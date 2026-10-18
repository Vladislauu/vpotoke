import {Router, urlencoded} from 'express';
import methodOverride from 'method-override';
import {
  index, show, createPage, create, sendMessage
} from '../controllers/convController.js';

const convRouter = Router();

convRouter.use((req, res, next) => {
  if (req.user == undefined) return res.redirect('/auth/login');
  else next();
})
convRouter.get('/', index);
convRouter.get('/create', createPage);
convRouter.post('/create', create);

convRouter.get('/:id', show);
convRouter.post('/:id/message', sendMessage);

export default convRouter;
