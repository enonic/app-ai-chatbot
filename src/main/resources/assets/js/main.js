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

  model.onButtonClick(response => {
    rasa.action(prevAction, response);
  });

  rasa.init(); // init session id

  rasa.onResponse(jsonResponse => {
    if (jsonResponse.status !== 200) {
      return;
    }

    const messages = jsonResponse.body;

    while (messages && messages.length > 0) {
      const message = messages.splice(0, 1);
      chatWindow.talk({
        ice: {
          says: message
        }
      });
    }
  });

  chatWindow.talk({
    ice: {
      says: ['Hi there!']
    }
  });

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
