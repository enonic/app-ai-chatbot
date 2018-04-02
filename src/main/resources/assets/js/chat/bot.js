import { messageType, options as defaultOptions } from './config';
// eslint-disable-next-line no-unused-vars
import { updateHistory } from './../history';
import validate from './validator';
import { renderBot, renderMessage, renderSeparator } from './renderer';

function validateAndRender(options) {
  // eslint-disable-next-line no-unused-vars
  const { parent, cacheLimit, sendCallback } = options;

  validate(parent);

  const botElement = renderBot(sendCallback);

  parent.appendChild(botElement);

  return botElement;
}

export default function Bot(options = {}) {
  const fullOptions = Object.assign({}, defaultOptions, options);
  let botElement;

  const talk = (say, reply, type) => {
    renderMessage(botElement, say, reply, type);
  };
  this.talk = talk;

  const selfTalk = say => talk(say, null, messageType.SELF);
  this.selfTalk = selfTalk;

  const userTalk = say => talk(say, null, messageType.USER);
  this.userTalk = userTalk;

  const botTalk = (say, reply, isNew) => {
    talk(say, reply, messageType.BOT);
    updateHistory({ text: say, isBot: true, isNew });
  };
  this.botTalk = botTalk;

  this.separator = () => {
    renderSeparator(botElement);
  };

  const botTalkNoHistory = say => talk(say, null, messageType.BOT);
  this.botTalkNoHistory = botTalkNoHistory;

  const { sendCallback } = fullOptions;
  fullOptions.sendCallback = msg => {
    sendCallback(msg);
    selfTalk(msg);
  };

  botElement = validateAndRender(fullOptions);
}
