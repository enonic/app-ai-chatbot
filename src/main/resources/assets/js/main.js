import Bot from './chat/bot';

require('../css/styles.less');
const rasa = require('../js/rasa');
const model = require('../js/model');
const history = require('../js/history');

(function main() {
  const bot = new Bot({
    parent: document.body,
    sendCallback: text => {
      rasa.message(text);
      history.updateHistory({ text, isBot: false });
    }
  });

  // eslint-disable-next-line no-unused-vars
  model.onButtonClick(response => {
    rasa.message('button_text'); // TODO
  });

  rasa.onResponse(messages => {
    let uniqueMessages;
    if (!messages || messages.length === 0) {
      uniqueMessages = ["Sorry, I'm not sure I understood you"];
    } else {
      // filter duplicates returned by RASA
      const uniques = {};
      for (const m in messages) {
        if (!uniques[messages[m]]) {
          uniques[messages[m]] = true;
        }
      }
      uniqueMessages = Object.keys(uniques);
    }
    while (uniqueMessages && uniqueMessages.length > 0) {
      bot.botTalk(uniqueMessages.splice(0, 1)[0], {});
    }
  });

  const onHistoryLoaded = chatHistory => {
    console.log('chat history:', chatHistory);
  };
  history.loadHistory(onHistoryLoaded);

  bot.botTalk('Hi there!');

  const statusElem = document.getElementById('status');
  const textArea = document.querySelector('textarea');

  const toggleOnlineStatus = function() {
    if (navigator.onLine) {
      statusElem.innerHTML = 'Online!';
      statusElem.classList.remove('offline');
      textArea.removeAttribute('disabled');
    } else {
      statusElem.classList.add('offline');
      statusElem.innerHTML = 'Waiting for network';
      textArea.setAttribute('disabled', 'disabled');
    }
  };

  toggleOnlineStatus();

  window.addEventListener('offline', toggleOnlineStatus);
  window.addEventListener('online', toggleOnlineStatus);
})();
