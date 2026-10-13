import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const SECRET = 'privetkakutebyadelahoroshoautebyakakdelatozhehorosho';

function extractToken(req, res, nex) {
  const auth = req.get('Authorization');
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
}

export async function isLoggedIn(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    res.status(401);
    return res.status(401).json({ message: 'Требуется вход в систему' });
  }
  try {
    const payload = jwt.verify(token, SECRET);
    const user = await User.findByPk(payload.id);
    if (!user) {
        res.status(401);
        return res.status(401).json({ message: 'Пользователь не найден' });
    }
    req.user = user;
    next();
  } catch (err) {
        res.status(401);
        return res.status(401).json({ message: 'Недействительный или истёкший жетон' });
  }
}

export async function loadCurrentUser(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, SECRET);
    const user = await User.findByPk(payload.id);
    if (user) req.user = user;
  } catch (_) {
  }
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Недостаточно прав' });
    }
    next();
  };
}