(function () {
  'use strict';

  const dialog = document.querySelector('.dialog[data-conv-id]');

  const messenger = document.querySelector('.messenger');
  const myId   = parseInt(messenger?.dataset.myId, 10);
  const convId = parseInt(dialog.dataset.convId, 10);

  const messagesBox = document.getElementById('messages');
  const noMessages  = document.getElementById('no-messages');
  const form        = document.getElementById('message-form');
  const input       = document.getElementById('message-input');
  const typingEl    = document.getElementById('typing-indicator');

  const socket = io({ withCredentials: true });

  socket.on('connect', () => {
    console.log('[socket] connected, id =', socket.id);
    socket.emit('conv:join', convId, (res) => {
      if (res?.error) console.error('[socket] join error:', res.error);
    });
  });

  // ─── Сообщения ───
  socket.on('chat:message', (m) => {
    if (parseInt(m.conv_id, 10) !== convId) return;
    if (messagesBox.querySelector(`[data-msg-id="${m.msg_id}"]`)) return;

    if (noMessages) noMessages.remove();

    const div = document.createElement('div');
    div.className = 'message';
    div.dataset.msgId = m.msg_id;
    div.innerHTML =
      `<span class="author">${escapeHtml(m.user.nickname)}:</span> ` +
      `<span class="text">${escapeHtml(m.text)}</span> ` +
      `<small>${new Date(m.sent).toLocaleString('ru-RU')}</small>`;
    messagesBox.appendChild(div);
    messagesBox.scrollTop = messagesBox.scrollHeight;
  });

  if (form) {
    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      socket.emit('chat:message', { convId, text }, (res) => {
        if (res?.error) {
          alert('Не удалось отправить: ' + res.error);
          return;
        }
        input.value = '';
        socket.emit('typing:stop', { convId });
      });
    });
  }

  // ─── Онлайн ───
  socket.on('presence:update', (ids) => {
    const set = new Set(ids.map(Number));
    document.querySelectorAll('.member').forEach((el) => {
      const id = parseInt(el.dataset.memberId, 10);
      const dot = el.querySelector('.online-dot');
      if (!dot) return;
      dot.classList.toggle('online', set.has(id));
      dot.title = set.has(id) ? 'в сети' : 'не в сети';
    });
  });

  // ─── Набор текста ───
  let typingTimer = null;
  let amTyping = false;
  if (input) {
    input.addEventListener('input', () => {
      if (!amTyping) {
        amTyping = true;
        socket.emit('typing:start', { convId });
      }
      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        amTyping = false;
        socket.emit('typing:stop', { convId });
      }, 2000);
    });
  }

  socket.on('typing:update', ({ convId: cid, userIds }) => {
    if (parseInt(cid, 10) !== convId) return;
    const others = userIds.map(Number).filter((id) => id !== myId);
    if (!typingEl) return;
    if (others.length === 0) { typingEl.textContent = ''; return; }
    if (others.length === 1) {
      const el = document.querySelector(
        `.member[data-member-id="${others[0]}"] .name`
      );
      typingEl.textContent =
        `${el ? el.textContent.trim() : 'Кто-то'} печатает…`;
      return;
    }
    typingEl.textContent = `Несколько человек печатают… (${others.length})`;
  });

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();