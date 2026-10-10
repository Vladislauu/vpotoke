import express from 'express';
import mainRouter from './source/routers/main.js';

const app = express();

app.enable('async');
app.set('view-engine', 'ejs');

app.locals.appTitle = 'Huynia';

app.use('/', mainRouter);
app.listen(8000, () => {console.log("Взлетаем")})