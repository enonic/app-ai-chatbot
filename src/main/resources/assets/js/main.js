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

  rasa.onResponse(response => {
    const msgs = response.messages;
    let uniqueMessages;
    if (msgs && msgs.length > 0) {
      // filter duplicates returned by RASA
      const uniques = {};
      for (const m in msgs) {
        if (msgs.hasOwnProperty(m)) {
          const msg = msgs[m];
          if (!uniques[msg.text]) {
            uniques[msg.text] = msg;
          }
        }
      }
      uniqueMessages = Object.values(uniques);
    }

    while (uniqueMessages && uniqueMessages.length > 0) {
      const message = uniqueMessages.splice(0, 1)[0];
      bot.botTalk(message.text, message.buttons);
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
        } else if (session.user === 'bot') {
          bot.botTalkNoHistory(session.text);
        } else {
          bot.selfTalk(session.text);
        }
      });
      bot.separator();
    }
    bot.botTalk('Hi there!', null, true);
  };
  history.loadHistory(onHistoryLoaded);
})();
