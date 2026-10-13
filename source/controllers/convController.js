import { Op } from 'sequelize';
import {
  Friendship,
  Conversation,
  ConversationMember,
  ConversationRole,
  Message,
  User
} from '../models/index.js';

// Достаём все беседы пользователя, отсортированные по дате создания
async function loadUserConvs(userId) {
  const memberships = await ConversationMember.findAll({
    where: { user_id: userId },
    include: [{ model: Conversation, as: 'conversation' }]
  });
  return memberships
    .map(m => m.conversation)
    .filter(Boolean)
    .sort((a, b) => new Date(b.conv_created) - new Date(a.conv_created));
}

// GET /conv — список бесед, диалог не открыт
export async function index(req, res, next) {
  try {
    if (!req.user) return res.redirect('/auth/login');
    const convs = await loadUserConvs(req.user.user_id);
    res.render('convIndex', { convs, activeConv: null, messages: [] });
  } catch (err) {
    next(err);
  }
}

// GET /conv/:id — беседа + сообщения
export async function show(req, res, next) {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const convId = parseInt(req.params.id, 10);
    if (isNaN(convId)) return res.status(400).send('Некорректный id');

    // Проверяем членство
    const membership = await ConversationMember.findOne({
      where: { user_id: req.user.user_id, conv_id: convId }
    });
    if (!membership) return res.status(403).send('Нет доступа');

    const activeConv = await Conversation.findByPk(convId);
    if (!activeConv) return res.status(404).send('Беседа не найдена');

    const convs = await loadUserConvs(req.user.user_id);

    const messages = await Message.findAll({
      where: { conv_id: convId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['user_id', 'nickname', 'avatar_path']
      }],
      order: [['sent', 'ASC']],
      limit: 200
    });

    res.render('convIndex', { convs, activeConv, messages });
  } catch (err) {
    next(err);
  }
}

// GET /conv/create — форма создания
export async function createPage(req, res, next) {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const me = req.user.user_id;

    const links = await Friendship.findAll({
      where: {
        [Op.or]: [
          { first_id: me },
          { second_id: me }
        ]
      },
      attributes: ['first_id', 'second_id']
    });

    const friendIds = new Set();
    for (const l of links) {
      friendIds.add(l.first_id === me ? l.second_id : l.first_id);
    }

    const users = friendIds.size === 0
      ? []
      : await User.findAll({
          where: { user_id: { [Op.in]: [...friendIds] } },
          attributes: ['user_id', 'nickname', 'avatar_path'],
          order: [['nickname', 'ASC']]
        });

    res.render('convCreate', { users });
  } catch (err) {
    next(err);
  }
}

// POST /conv/create — создание беседы
export async function create(req, res, next) {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const convName = (req.body.conv_name || '').trim();
    const convAvatar = (req.body.conv_avatar || '').trim()
                    || '/static/default-conv.webp';

    if (convName.length < 3 || convName.length > 128) {
      return res.status(400).send('Название: 3–128 символов');
    }

    // user_ids приходит либо массивом, либо строкой (один чекбокс)
    let userIds = req.body.user_ids || [];
    if (!Array.isArray(userIds)) userIds = [userIds];
    userIds = userIds
      .map(id => parseInt(id, 10))
      .filter(n => !isNaN(n));

    // Добавляем себя
    if (!userIds.includes(req.user.user_id)) userIds.push(req.user.user_id);

    if (userIds.length < 2) {
      return res.status(400).send('Выберите хотя бы одного участника');
    }

    const conv = await Conversation.create({
      conv_name: convName,
      conv_created: new Date(),
      conv_avatar: convAvatar
    });

    await ConversationMember.bulkCreate(
      userIds.map(uid => ({
        user_id: uid,
        conv_id: conv.conv_id,
        role_id: 0
      }))
    );

    res.redirect(`/conv/${conv.conv_id}`);
  } catch (err) {
    next(err);
  }
}

// POST /conv/:id/message — отправить сообщение
export async function sendMessage(req, res, next) {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const convId = parseInt(req.params.id, 10);
    if (isNaN(convId)) return res.status(400).send('Некорректный id');

    const text = (req.body.text || '').trim();
    if (!text) return res.redirect(`/conv/${convId}`);

    const membership = await ConversationMember.findOne({
      where: { user_id: req.user.user_id, conv_id: convId }
    });
    if (!membership) return res.status(403).send('Нет доступа');

    await Message.create({
      user_id: req.user.user_id,
      conv_id: convId,
      sent: new Date(),
      text
    });

    res.redirect(`/conv/${convId}`);
  } catch (err) {
    next(err);
  }
}