import { messageType, options as defaultOptions } from './config';
// eslint-disable-next-line no-unused-vars
import { updateHistory } from './../history';
import validate from './validator';
import { renderBot, renderMessage, renderSeparator, toggleOnlineStatus } from './renderer';
import { getSender } from './../rasa';

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

  this.toggleOnline = toggleOnlineStatus;

  let greetingMessage;
  const botTalk = (say, reply, isNew) => {
    talk(say, reply, messageType.BOT);

    const senderId = getSender();
    if (isNew) {
      greetingMessage = { text: say, isBot: true };
    } else {
      updateHistory(senderId, { text: say, isBot: true });
    }
  };
  this.botTalk = botTalk;

  this.separator = () => {
    renderSeparator(botElement);
  };

  const botTalkNoHistory = say => talk(say, null, messageType.BOT);
  this.botTalkNoHistory = botTalkNoHistory;

  const { sendCallback } = fullOptions;
  fullOptions.sendCallback = (msg) => {
    if (greetingMessage) {
      updateHistory(getSender(), greetingMessage);
      greetingMessage = null;
    }

    sendCallback(msg, greetingMessage);
    selfTalk(msg);
  };

  botElement = validateAndRender(fullOptions);
}
