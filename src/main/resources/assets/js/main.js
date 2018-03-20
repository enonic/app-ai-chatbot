require('../css/styles.less');
const chat = require('../js/bubble/Bubbles');
const rasa = require('../js/rasa');
const model = require('../js/model');

(function main() {
  let prevAction;

  const chatWindow = new chat.Bubbles(
    document.getElementById('chat'),
    'chatWindow',
    {
      inputCallbackFn(o) {
        rasa.message(o.input);
      }
    }
  );
  window.chatWindow = chatWindow;

  const actionToTemplate = action => model.templates[action] || null;

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
      chatWindow.talk({ ice: template });
      if (rasa.actions.ASK_PRICE !== nextAction) {
        // TODO: check all actions with buttons
        rasa.action(nextAction);
      } else {
        prevAction = nextAction;
      }
    } else {
      console.log(`RASA: ${nextAction}`);
    }
  });

  chatWindow.talk({
    ice: {
      says: ['Hi there!']
    }
  });
})();
