import express from 'express';

import mainRouter from './source/routers/main.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { connectToDB } from './source/models/index.js';
import { loadCurrentUser } from './source/middleware/authMiddleware.js';

const app = express();
const port = 8080;

app.enable('async');
app.set('view engine', 'ejs');
app.set('views', './source/views')

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/static', express.static('public'));

app.use(loadCurrentUser);   //для вьюшек
app.use((req, res, next) => {
  res.locals.user = req.user ? {
    user_id:     req.user.user_id,
    nickname:    req.user.nickname,
    avatar_path: req.user.avatar_path,
    status:      req.user.status
  } : null;
  next();
});

app.use('/', mainRouter);

(async () => {
  await connectToDB();
  app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
  });
})();