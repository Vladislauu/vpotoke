import { Op } from 'sequelize';
import { Post, User, Subscription, PostSeen } from '../models/index.js';

// GET /  — лента постов авторов, на которых подписан пользователь
export async function feed(req, res, next) {
  try {
    // Гость — пустая лента
    if (!req.user) {
      return res.render('feed', { posts: [] });
    }

    const currentUserId = req.user.user_id;

    // Кого читаем
    const subs = await Subscription.findAll({
      where: { user_id: currentUserId },
      attributes: ['author_id']
    });
    const authorIds = subs.map(s => s.author_id);

    if (authorIds.length === 0) {
      return res.render('feed', { posts: [] });
    }

    const posts = await Post.findAll({
      where: { user_id: { [Op.in]: authorIds } },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'nickname', 'avatar_path']
      }],
      order: [['created', 'DESC']],
      limit: 50
    });

    // Пометить как прочитанные. composite PK (post_id, user_id),
    // Postgres сгенерирует ON CONFLICT DO NOTHING
    if (posts.length > 0) {
      await PostSeen.bulkCreate(
        posts.map(p => ({ post_id: p.post_id, user_id: currentUserId })),
        { ignoreDuplicates: true }
      );
    }

    res.render('feed', { posts });
  } catch (err) {
    next(err);
  }
}