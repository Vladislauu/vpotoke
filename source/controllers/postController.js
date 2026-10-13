import { Op } from 'sequelize';
import { Post, User, Subscription, PostSeen, Friendship } from '../models/index.js';

export async function feed(req, res, next) {
  try {
    if (!req.user) {
      return res.render('feed', { posts: [] });
    }

    const me = req.user.user_id;

    const links = await Friendship.findAll({
      where: {
        [Op.or]: [{ first_id: me }, { second_id: me }]
      },
      attributes: ['first_id', 'second_id']
    });

    const friendIds = [
      ...new Set(
        links.map(l => l.first_id === me ? l.second_id : l.first_id)
      )
    ];

    if (friendIds.length === 0) {
      return res.render('feed', { posts: [] });
    }

    const posts = await Post.findAll({
      where: { user_id: { [Op.in]: friendIds } },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'nickname', 'avatar_path']
      }],
      order: [['created', 'DESC']],
      limit: 50
    });

    res.render('feed', { posts });
  } catch (err) {
    next(err);
  }
}