import {Router, urlencoded} from 'express';
import methodOverride from 'method-override';

import {
  register, login, me, logout
} from '../controllers/authController.js';
import { registerV, loginV } from '../validators/authValidator.js';
import { handleErrors } from '../middleware/handleErrors.js';
import { isLoggedIn } from '../middleware/authMiddleware.js';

const authRouter = Router();


authRouter.get('/register', (req, res) => {
    res.render('register.ejs', {
        errors: {},
        body: req
    });
})
authRouter.post('/register', handleErrors, register);

authRouter.get('/login', (req, res) => {
    res.render('login.ejs', {
        errors: {},
        body: req
    });
})
authRouter.post('/login', handleErrors, login);

authRouter.get('/me', isLoggedIn, me);
authRouter.get('/logout', isLoggedIn, logout);

authRouter.get('/', (req, res) => {
    res.send("Auth page");
})
export default authRouter;