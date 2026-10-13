// source/controllers/userController.js
import { Op } from 'sequelize';
import { User, Post, Friendship } from '../models/index.js';

// GET /user/:id — страница пользователя
export async function show(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) return res.status(400).send('Некорректный id');

    const profileUser = await User.findByPk(userId, {
      attributes: ['user_id', 'nickname', 'avatar_path', 'status']
    });
    if (!profileUser) return res.status(404).send('Пользователь не найден');

    const posts = await Post.findAll({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'nickname', 'avatar_path']
      }],
      order: [['created', 'DESC']],
      limit: 50
    });

    // Флаги для шаблона
    const isSelf = req.user && req.user.user_id === userId;

    let isFriend = false;
    if (req.user && !isSelf) {
      const f = await Friendship.findOne({
        where: {
          [Op.or]: [
            { first_id: req.user.user_id, second_id: userId },
            { first_id: userId, second_id: req.user.user_id }
          ]
        }
      });
      isFriend = !!f;
    }

    res.render('user', { profileUser, posts, isFriend, isSelf });
  } catch (err) {
    next(err);
  }
}

// POST /user/:id/post — создать пост (только на своей странице)
export async function createPost(req, res, next) {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) return res.status(400).send('Некорректный id');

    // Создавать посты можно только от своего имени
    if (userId !== req.user.user_id) {
      return res.status(403).send('Можно публиковать только на своей странице');
    }

    const text = (req.body.text || '').trim();
    if (!text) return res.redirect(`/user/${userId}`);

    await Post.create({
      user_id: req.user.user_id,
      created: new Date(),
      text
    });

    res.redirect(`/user/${userId}`);
  } catch (err) {
    next(err);
  }
}

// POST /user/:id/friend — добавить в друзья
export async function addFriend(req, res, next) {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) return res.status(400).send('Некорректный id');
    if (req.user.user_id === targetId) return res.redirect(`/user/${targetId}`);

    const target = await User.findByPk(targetId);
    if (!target) return res.status(404).send('Пользователь не найден');

    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { first_id: req.user.user_id, second_id: targetId },
          { first_id: targetId, second_id: req.user.user_id }
        ]
      }
    });

    if (!existing) {
      const a = Math.min(req.user.user_id, targetId);
      const b = Math.max(req.user.user_id, targetId);
      await Friendship.create({ first_id: a, second_id: b });
    }

    res.redirect(`/user/${targetId}`);
  } catch (err) {
    next(err);
  }
}

// POST /user/:id/unfriend — удалить из друзей
export async function removeFriend(req, res, next) {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) return res.status(400).send('Некорректный id');
    if (req.user.user_id === targetId) return res.redirect(`/user/${targetId}`);

    // Дружба хранится как нормализованная пара (min, max)
    const a = Math.min(req.user.user_id, targetId);
    const b = Math.max(req.user.user_id, targetId);

    await Friendship.destroy({
      where: { first_id: a, second_id: b }
    });

    res.redirect(`/user/${targetId}`);
  } catch (err) {
    next(err);
  }
}

// GET /user/me — редирект на свою страницу
export function me(req, res) {
  if (!req.user) return res.redirect('/auth/login');
  res.redirect(`/user/${req.user.user_id}`);
}