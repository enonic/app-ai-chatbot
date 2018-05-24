import Bot from './chat/bot';

require('../css/styles.less');
const rasa = require('../js/rasa');
const history = require('../js/history');

(function main() {
  const bot = new Bot({
    parent: document.body,
    sendCallback: text => {
      rasa.message(text);
      history.updateHistory(rasa.getSender(), { text, isBot: false });
    }
  });

  rasa.onResponse(response => {
    if (response.action === 'tracker') {
      console.log('Tracker', response);
    }
    if (response.redirect) {
      // eslint-disable-next-line no-restricted-globals
      location.href = response.loginUrl;
    }
    const msgs = response.messages;
    while (msgs && msgs.length > 0) {
      const message = msgs.splice(0, 1)[0];
      if (message.restarted) {
        bot.separator();
        rasa.tracker();
      }
      bot.botTalk(message.text, message.buttons);
    }
  });

  rasa.onFailure(() => {
    bot.toggleOnline(false);
  });

  const onHistoryLoaded = chatHistory => {
    console.log('chat history:', chatHistory);
    if (chatHistory) {
      chatHistory.forEach(session => {
        if (Array.isArray(session.messages)) {
          session.messages.forEach(message => {
            if (message.author === 'bot') {
              bot.botTalkNoHistory(message.text);
            } else {
              bot.selfTalk(message.text);
            }
          });
        } else if (session.author === 'bot') {
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

  // ask version to turn off chat if rasa server is unavailable
  rasa.version();
})();
