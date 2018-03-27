import Bot from './chat/bot';

require('../css/styles.less');
const rasa = require('../js/rasa');
const model = require('../js/model');
const history = require('../js/history');

(function main() {
  let prevAction;

  const bot = new Bot({
    parent: document.body,
    sendCallback: text => {
      rasa.message(text);
      history.updateHistory({ text, isBot: false });
    }
  });

  const actionToTemplate = action => model.templates[action] || null;
  const templateToMessage = template => template.says[0];
  const templateToReply = template =>
    template.reply ? template.reply.map(r => r.question) : null;

  model.onButtonClick(response => {
    rasa.action(prevAction, response);
  });

  rasa.init(); // init session id

  rasa.onResponse(jsonResponse => {
    if (jsonResponse.status !== 200) {
      return;
    }

    const nextAction = JSON.parse(jsonResponse.body).next_action;

    const template = actionToTemplate(nextAction);

    if (template && rasa.actions.ACTION_LISTEN !== nextAction) {
      // not showing 'on it' action in chat window
      if (rasa.actions.ON_IT !== nextAction) {
        bot.botTalk(templateToMessage(template), templateToReply(template));
      }

      if (rasa.actions.ASK_PRICE !== nextAction) {
        rasa.action(nextAction);
      } else {
        prevAction = nextAction;
      }
    } else {
      console.log(`RASA: ${nextAction}`);
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
