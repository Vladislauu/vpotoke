// source/validators/authValidators.js
import { body } from 'express-validator';
import { User } from '../models/index.js';

export const registerV = [
  body('nickname')
    .isString().trim().notEmpty()
    .withMessage('Имя пользователя не указано')
    .isLength({ min: 3, max: 50 })
    .withMessage('Имя пользователя должно быть от 3 до 50 символов')
    .custom(async (value) => {
      const user = await User.findOne({ where: { username: value } });
      if (user) throw new Error('Пользователь с таким именем уже зарегистрирован');
      return true;
    }),

  body('password')
    .isString().trim().notEmpty()
    .withMessage('Пароль не указан')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),

  body('password2')
    .isString().trim().notEmpty()
    .withMessage('Повтор пароля не указан')
    .custom((value, { req }) => {
      if (req.body.password !== value) throw new Error('Введённые пароли не совпадают');
      return true;
    })
];

export const loginV = [
  body('username').isString().trim().notEmpty()
    .withMessage('Имя пользователя не указано'),
  body('password').isString().trim().notEmpty()
    .withMessage('Пароль не указан')
];