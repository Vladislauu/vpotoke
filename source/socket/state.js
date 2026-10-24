// source/socket/state.js

// userId -> Set<socketId>
export const onlineUsers = new Map();

// convId -> Map<userId, Set<socketId>>
export const typingByConv = new Map();

// ─── Онлайн-пользователи ───
export function addOnline(userId, socketId) {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
}

export function removeOnline(userId, socketId) {
  const set = onlineUsers.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) onlineUsers.delete(userId);
}

export function getOnlineIds() {
  return [...onlineUsers.keys()];
}

// ─── Печатающие пользователи ───
export function addTyping(convId, userId, socketId) {
  if (!typingByConv.has(convId)) typingByConv.set(convId, new Map());
  const map = typingByConv.get(convId);
  if (!map.has(userId)) map.set(userId, new Set());
  map.get(userId).add(socketId);
}

export function removeTyping(convId, userId, socketId) {
  const map = typingByConv.get(convId);
  if (!map) return;
  const set = map.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) map.delete(userId);
  if (map.size === 0) typingByConv.delete(convId);
}

export function getTypingUserIds(convId) {
  const map = typingByConv.get(convId);
  return map ? [...map.keys()] : [];
}

export function getAllConvIdsWithTyping() {
  return [...typingByConv.keys()];
}