// source/socket/auth.js
import * as cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const SECRET = 'privetkakutebyadelahoroshoautebyakakdelatozhehorosho';

export function socketAuth(io) {
  io.use(async (socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie || '';
      console.log('[socket auth] raw cookie:', raw || '(пусто)');

      const cookies = cookie.parse(raw);
      const token = cookies.token;
      console.log('[socket auth] token:', token ? token.slice(0, 25) + '…' : '(нет)');

      if (!token) {
        console.warn('[socket auth] → нет токена в cookie');
        return next(new Error('unauthorized'));
      }

      const payload = jwt.verify(token, SECRET);
      console.log('[socket auth] JWT ok, id =', payload.id);

      const user = await User.findByPk(payload.id);
      if (!user) {
        console.warn('[socket auth] → пользователь не найден');
        return next(new Error('unauthorized'));
      }

      socket.data.user = user;
      next();
    } catch (err) {
      console.error('[socket auth] ОШИБКА:', err.name, '—', err.message);
      next(new Error('unauthorized'));
    }
  });
}