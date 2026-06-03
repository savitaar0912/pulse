// In-memory map of userId → res (SSE response object)
const clients = new Map();

export const addClient = (userId, res) => {
  clients.set(userId.toString(), res);
};

export const removeClient = (userId) => {
  clients.delete(userId.toString());
};

export const sendToUser = (userId, event, data) => {
  const client = clients.get(userId.toString());
  if (client) {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
};

export const sendToUsers = (userIds, event, data) => {
  userIds.forEach(id => sendToUser(id, event, data));
};