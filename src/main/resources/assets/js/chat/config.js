export const historyCacheKey = 'enonic-bot-messages';

export const options = {
  userId: 'user',
  botId: 'bot',
  parent: null,
  cacheLimit: Infinity,
  sendCallback: () => {}
};

export const messageType = {
  SELF: 'self',
  USER: 'user',
  BOT: 'bot'
};
