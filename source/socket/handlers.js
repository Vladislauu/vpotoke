// source/socket/handlers.js
import {
  ConversationMember,
  Message
} from '../models/index.js';

import {
  addOnline, removeOnline, getOnlineIds,
  addTyping, removeTyping, getTypingUserIds,
  getAllConvIdsWithTyping
} from './state.js';

function broadcastPresence(io) {
  io.emit('presence:update', getOnlineIds());
}

function broadcastTyping(io, convId) {
  io.to(`conv:${convId}`).emit('typing:update', {
    convId,
    userIds: getTypingUserIds(convId)
  });
}

export function registerHandlers(io, socket) {
  const user = socket.data.user;
  const userId = user.user_id;

  // ─── Подключился ───
  addOnline(userId, socket.id);
  socket.join(`user:${userId}`);
  broadcastPresence(io);

  // ─── Присоединиться к комнате беседы ───
  socket.on('conv:join', async (convId, cb) => {
    try {
      const id = parseInt(convId, 10);
      if (isNaN(id)) return cb?.({ error: 'bad conv id' });

      const member = await ConversationMember.findOne({
        where: { conv_id: id, user_id: userId }
      });
      if (!member) return cb?.({ error: 'no access' });

      socket.join(`conv:${id}`);
      cb?.({ ok: true });
    } catch (err) {
      console.error('[socket conv:join]', err);
      cb?.({ error: 'server error' });
    }
  });

  // ─── Покинуть комнату (при смене беседы) ───
  socket.on('conv:leave', (convId) => {
    const id = parseInt(convId, 10);
    if (!isNaN(id)) socket.leave(`conv:${id}`);
  });

  // ─── Отправка сообщения ───
  socket.on('chat:message', async (payload, cb) => {
    try {
      const convId = parseInt(payload?.convId, 10);
      const text = String(payload?.text || '').trim();
      if (isNaN(convId) || !text) return cb?.({ error: 'bad payload' });
      if (text.length > 5000) return cb?.({ error: 'too long' });

      const member = await ConversationMember.findOne({
        where: { conv_id: convId, user_id: userId }
      });
      if (!member) return cb?.({ error: 'no access' });

      const msg = await Message.create({
        user_id: userId,
        conv_id: convId,
        sent: new Date(),
        text
      });

      const message = {
        msg_id: msg.msg_id,
        conv_id: msg.conv_id,
        user_id: msg.user_id,
        text: msg.text,
        sent: msg.sent,
        user: {
          user_id: user.user_id,
          nickname: user.nickname,
          avatar_path: user.avatar_path
        }
      };

      // Рассылаем всем в комнате, включая отправителя
      io.to(`conv:${convId}`).emit('chat:message', message);
      cb?.({ ok: true, message });
    } catch (err) {
      console.error('[socket chat:message]', err);
      cb?.({ error: 'server error' });
    }
  });

  // ─── Набор текста ───
  socket.on('typing:start', ({ convId } = {}) => {
    const id = parseInt(convId, 10);
    if (isNaN(id)) return;
    addTyping(id, userId, socket.id);
    broadcastTyping(io, id);
  });

  socket.on('typing:stop', ({ convId } = {}) => {
    const id = parseInt(convId, 10);
    if (isNaN(id)) return;
    removeTyping(id, userId, socket.id);
    broadcastTyping(io, id);
  });

  // ─── Отключился ───
  socket.on('disconnect', () => {
    removeOnline(userId, socket.id);

    // Убираем из всех «печатающих» этот сокет
    for (const convId of getAllConvIdsWithTyping()) {
      removeTyping(convId, userId, socket.id);
      broadcastTyping(io, convId);
    }

    broadcastPresence(io);
  });
}