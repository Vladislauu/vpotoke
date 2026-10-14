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

    return res.redirect('/auth/login');

  } catch (err) {
      return authError(req, res, 'Ошибка регистрации', 500);
  }
}

export async function login(req, res, next) {
  try {
    const { nickname, password } = req.body;

    const user = await User.findOne({ where: { nickname } });
    if (!user) return authError(req, res, 'Такого пользователя не существует', 401)

    const ok = await verifyPassword(password, user.password, user.salt);

    if (!ok) return authError(req, res, "Неверное имя пользователя или пароль", 401)

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

    // res.status(200).json({
    //   message: 'Вход выполнен',
    //   token,
    //   user: user.toJSON()
    // });
    return res.redirect('/');
  } 
  catch (err) {
    return authError(req, res, "Ошибка входа", 500)
    //next(err);
  }
}

export async function me(req, res) {
  return res.status(200).json({ user: req.user.toJSON() });
 // res.redirect('/');
}

export async function logout(req, res) {
  res.clearCookie('token');
  //res.status(204);
  return res.redirect('/auth/login');
}

function authError(req, res, error, code) {
    res.status(code);
    res.render('login', {
      error: error,
      code: code,
      body: {}
    })
    return true;
}