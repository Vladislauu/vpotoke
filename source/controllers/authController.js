import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { hashPassword, verifyPassword } from '../utility.js';

const SECRET = 'privetkakutebyadelahoroshoautebyakakdelatozhehorosho';
const TOKEN_LIFETIME = '7d';

export async function register(req, res, next) {
  try {
    const { nickname, password } = req.body;

    const { hash, salt } = await hashPassword(password);

    const user = await User.create({
      nickname,
      password: hash,
      salt
    });

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: user.toJSON()
    });
    res.redirect('/auth/login');
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { nickname, password } = req.body;

    const user = await User.findOne({ where: { nickname } });
    if (!user) {
      return res.status(401).json({ message: 'Такого пользователя не существует' });
    }

    const ok = await verifyPassword(password, user.password, user.salt);

    if (!ok) {
      return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
    }

    const token = jwt.sign(
      { id: user.user_id, nickname: user.nickname},
      SECRET,
      { expiresIn: TOKEN_LIFETIME }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: 'Вход выполнен',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.status(200).json({ user: req.user.toJSON() });
  res.redirect('/');
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.status(204).end();
}