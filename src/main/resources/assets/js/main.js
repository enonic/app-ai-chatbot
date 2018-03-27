require('../css/styles.less');
const chat = require('../js/bubble/Bubbles');
const rasa = require('../js/rasa');
const model = require('../js/model');

(function main() {
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

  // eslint-disable-next-line no-unused-vars
  model.onButtonClick(response => {
    rasa.message('button_text'); // TODO
  });

  rasa.onResponse(messages => {
    while (messages && messages.length > 0) {
      chatWindow.talk({
        ice: {
          says: messages.splice(0, 1)
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
