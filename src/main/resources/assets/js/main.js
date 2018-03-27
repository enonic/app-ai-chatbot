import Bot from './chat/bot';

require('../css/styles.less');
const rasa = require('../js/rasa');
const history = require('../js/history');

(function main() {
  const bot = new Bot({
    parent: document.body,
    sendCallback: text => {
      rasa.message(text);
      history.updateHistory({ text, isBot: false });
    }
  });

  rasa.onResponse(messages => {
    let uniqueMessages;
    if (messages && messages.length > 0) {
      // filter duplicates returned by RASA
      const uniques = {};
      for (const m in messages) {
        if (!uniques[messages[m]]) {
          uniques[messages[m]] = true;
        }
      }
      uniqueMessages = Object.keys(uniques);
    }
    const buttonRegex = RegExp('^\\d+:\\s(.+)\\s\\((.+)\\)$');

    const buttons = [];

    while (uniqueMessages && uniqueMessages.length > 0) {
      const message = uniqueMessages.splice(0, 1)[0];

      if (!buttonRegex.test(message)) {
        bot.botTalk(message, {});
      } else {
        buttons.push(buttonRegex.exec(message)[1]);
      }
    }

    if (buttons.length > 0) {
      bot.botTalk(null, buttons);
    }
  });

  const onHistoryLoaded = chatHistory => {
    console.log('chat history:', chatHistory);
    if (chatHistory) {
      chatHistory.forEach(session => {
        if (Array.isArray(session.messages)) {
          session.messages.forEach(message => {
            if (message.user === 'bot') {
              bot.botTalkNoHistory(message.text);
            } else {
              bot.selfTalk(message.text);
            }
          });
        } else if (session.messages.user === 'bot') {
          bot.botTalkNoHistory(session.messages.text);
        } else {
          bot.selfTalk(session.messages.text);
        }
      });
    }

    bot.botTalk('Hi there!', null, true);
  };
  history.loadHistory(onHistoryLoaded);
})();
