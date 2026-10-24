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

export async function index(req, res, next) {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const convs = await loadUserConvs(req.user.user_id);

    return res.render('convIndex', {
      convs,
      activeConv: null,
      messages: [],
      members: [],
      roles: [],
      isAdmin: false,
      myUserId: req.user.user_id,   // ← вот этого не хватало
      availableFriends: []
    });
  } catch (err) {
    return next(err);
  }
}

// GET /conv/:id — беседа + сообщения
export async function show(req, res, next) {
  try {
    if (!req.user) return res.redirect('/auth/login');

    const convId = parseInt(req.params.id, 10);
    if (isNaN(convId)) return res.status(400).send('Некорректный id');

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

    const members = await ConversationMember.findAll(
      {
        where: {conv_id: convId},
        include: 
        [
          {model: User, as: 'user', attributes: ['user_id', 'nickname', 'avatar_path']},
          {model: ConversationRole, as: 'role'}
        ]
      })

      const roles = await ConversationRole.findAll(
        {
          order: [['role_id', 'ASC']]
        }
      )

      const myRole = members.find(m=> m.user_id === req.user.user_id).role.name;
      const isAdmin = ((myRole.trim() === 'admin') || (myRole.trim() ==='moderator'));

    res.render('convIndex', 
      { 
        convs, 
        activeConv, 
        messages, 
        members, 
        roles, 
        isAdmin, 
        myUserId: 
        req.user.user_id 
    });
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

    let userIds = req.body.user_ids || [];
    if (!Array.isArray(userIds)) userIds = [userIds];
    userIds = userIds
      .map(id => parseInt(id, 10))
      .filter(n => !isNaN(n));

    //if (!userIds.includes(req.user.user_id)) userIds.push(req.user.user_id);

    if (userIds.length < 2) {
      return res.status(400).send('Выберите хотя бы одного участника');
    }

    const conv = await Conversation.create({
      conv_name: convName,
      conv_created: new Date(),
      conv_avatar: convAvatar
    });

    await ConversationMember.create({
      user_id: req.user.user_id,
      conv_id: conv.conv_id,
      role_id: 2
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

export async function updateMemberRole(req, res, next)
{
  try 
  {
    if (!req.user) return res.redirect('/auth/login');

    const convId = parseInt(req.params.id);
    const targetId = parseInt(req.params.userId);
    const roleId = parseInt(req.body.role_id, 10);

    if ([convId, targetId, roleId].some(isNaN))
    {
      return res.status(400).send('Некорректные данные');
    }

    const my = await ConversationMember.findOne(
      {
        where: { conv_id: convId, user_id: req.user.user_id},
        include: [{model: ConversationRole, as: 'role'}]
      }
    );

    if (!my || my.role.name.trim() !== 'admin')
    {
      return res.status(403).send('Недостаточно прав');
    }

    const target = await ConversationMember.findOne(
      {
        where: {conv_id: convId, user_id: targetId},
        include: [{ model: ConversationRole, as: 'role'}]
      }
    )

    if (!target) return res.status(400).send('Участник не найден');

    const newRole = await(ConversationRole.findByPk(roleId));
    if (!newRole) return res.status(400).send('Роль не существует');

    if (target.role.name.trim() === 'admin' || newRole.name.trim() == 'admin') return res.status(403).send('Некорректный запрос');
    target.role_id = newRole.role_id;
    await target.save();
    res.redirect(`/conv/${convId}`);
  }
  catch(err)
  {
    next(err)
  }
}

export async function kickMember(req, res, next)
{
  try 
  {
    if (!req.user) return res.redirect('/auth/login');

    const convId = parseInt(req.params.id);
    const targetId = parseInt(req.params.userId);
    if ([convId, targetId].some(isNaN)) return res.status(400).send('Некорректные параметры');

    const my = await ConversationMember.findOne(
      {
        where: {conv_id: convId, user_id: req.user.user_id},
        include: [{model: ConversationRole, as:'role'}]
      }
    );

    if (!my || (my.role.name.trim() !== 'admin' && my.role.name.trim() !== 'moderator')) return res.status(403).send('Недостаточно прав');
    if (targetId === req.user.user_id) return res.status(400).send('Некорректный запрос');

    const targetRole = await ConversationMember.findOne(
      {
        where: { conv_id: convId, user_id: targetId},
        include: [{model: ConversationRole, as:'role'}]
      }
    )

    if ( !targetRole || ( (targetRole.role.name.trim() == 'moderator' || targetRole.role.name.trim() == 'admin') && my.role.name.trim() == 'moderator') ) return res.status(403).send('Недостаточно прав');

    await ConversationMember.destroy({where: { conv_id: convId, user_id: targetId},});

    return res.redirect(`/conv/${convId}`);
  }
  catch(err)
  {
    next(err)
  }
}

export async function leaveConv(req, res, next)
{
  try
  {
    if (!req.user) return res.redirect('/auth/login');

    const convId = parseInt(req.params.id);
    if (isNaN(convId)) return res.status(400).send('Некорректный id');

    const membership = await ConversationMember.findOne({
      where: { conv_id: convId, user_id: req.user.user_id}
    })

    if (!membership) return res.status(404).send('Вы не участник беседы');

    await membership.destroy();

    const remaining = await ConversationMember.count({ where: {conv_id: convId}});

    if (remaining == 0)
    {
      await Message.destroy({where:{ conv_id: convId}});
      await Conversation.destroy({where: {conv_id: convId}});
    }

    return res.redirect('/conv');
  }
  catch (err)
  {
    next(err);
  }
}

export async function addMember(req, res, next)
{
  try
  {
    if (!req.user) return res.redirect('/auth/login');
    const userId = parseInt(req.params.userId);
    const convId = parseInt(req.params.id);

    if (([convId, userId].some(isNaN))) return res.status(400).send('Некорректные параметры');

    const me = await ConversationMember.findOne(
      {where: { conv_id: convId, user_id: req.user.user_id }}
    )
    if (!me) return res.status(403).send('Вы не состоите в этой беседе');

    const target = await User.findByPk(userId);
    if (!target) return res.status(400).send('Пользователь не найден');

    const existing = await ConversationMember.findOne(
      {where: {conv_id:convId, user_id:userId}}
    )
    if (existing) return res.redirect(`/conv/${convId}`);

    const link = await Friendship.findOne({
      where: {
        [Op.or]: [
          { first_id: req.user.user_id, second_id: userId },
          { first_id: userId, second_id: req.user.user_id }
        ]
      }
    });
    if (!link) return res.status(403).send('Добавлять можно только друзей');

    await ConversationMember.create(
      {
        conv_id: convId,
        user_id: userId,
        role_id: 0
    });

    return res.redirect(`/conv/${convId}`);
  }
  catch(err)
  {
    next(err);
  }
}