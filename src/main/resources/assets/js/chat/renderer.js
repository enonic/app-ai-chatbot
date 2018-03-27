import autoresize from 'autoresize';
import throttle from './utils';

function createElement(classNames, innerHTML, type = 'div') {
  const div = document.createElement(type);
  classNames.split(' ').forEach(className => {
    if (className) {
      div.classList.add(className);
    }
  });
  if (innerHTML && innerHTML.length > 0) {
    div.innerHTML = innerHTML;
  }
  return div;
}

function addInputEventListeners(input, sendCallback) {
  const textarea = input.firstElementChild;
  const button = input.lastElementChild;
  const feed = input.previousElementSibling;

  let wasEmpty = true;
  const toggleEmptyClass = throttle(event => {
    const isEmpty = !event.target.value;
    if (isEmpty !== wasEmpty) {
      wasEmpty = isEmpty;
      if (isEmpty) {
        input.classList.add('chat-input--empty');
      } else {
        input.classList.remove('chat-input--empty');
      }
    }
  });

  const send = () => {
    const text = textarea.value;
    if (text) {
      const lastMessage = feed.lastElementChild;
      const hasReply = lastMessage.classList.contains(
        'chat-message-feed__message--reply'
      );
      if (hasReply) {
        lastMessage.lastElementChild.remove();
        lastMessage.classList.remove('chat-message-feed__message--reply');
      }

      textarea.value = '';
      sendCallback(text);
    }
  };

  const sendOnEnter = event => {
    const isEnter = event.keyCode === 13;
    const isPC = event.key === event.code;
    if (isEnter && isPC) {
      event.preventDefault();
      event.stopPropagation();
      send();
    }
  };

  textarea.addEventListener('keydown', event => {
    sendOnEnter(event);
    toggleEmptyClass(event);
  });
  autoresize(textarea, { minimumRows: 1, maximumRows: 5 });

  button.addEventListener('click', send);

  return input;
}

function addFeedEventListeners(feed, sendCallback) {
  feed.addEventListener('click', event => {
    const { target } = event;
    const isOption = target.classList.contains(
      'chat-message-feed__message-option'
    );
    if (isOption) {
      const text = target.innerHTML;
      const message = target.parentElement.parentElement;
      target.parentElement.remove();
      message.classList.remove('chat-message-feed__message--reply');
      sendCallback(text);
    }
  });
}

export function renderBot(sendCallback) {
  const wrapper = createElement('chat-wrapper');
  // TODO: Add status <div id="status" class="status"></div>
  wrapper.innerHTML = `
  <div class="chat-placeholder">
    <div class="chat-message-feed"></div>
    <div class="chat-input chat-input--empty">
      <textarea class='chat-input__input' autofocus rows="1" placeholder='Write a message…'></textarea>
      <button class="chat-input__send" name="Send"></button>
    </div>
  </div>
  `;

  const input = wrapper.firstElementChild.lastElementChild;
  addInputEventListeners(input, sendCallback);

  const feed = wrapper.firstElementChild.firstElementChild;
  addFeedEventListeners(feed, sendCallback);

  return wrapper;
}

export function renderMessage(bot, say, reply, type) {
  const feed = bot.firstElementChild.firstElementChild;
  const hasReply = !!reply && reply.length > 0;
  const mapReply = options =>
    options.map(
      option => `<div class="chat-message-feed__message-option">${option}</div>`
    );
  const options = hasReply
    ? `
    <div class="chat-message-feed__message-options">
      ${mapReply(reply).join('')}
    </div>
  `
    : '';
  const classNames = `chat-message-feed__message chat-message-feed__message--${type} ${
    hasReply ? 'chat-message-feed__message--reply' : ''
  }`;
  const text =
    say && say.length > 0
      ? `<div class="chat-message-feed__message-text">${say}</div>`
      : '';
  const message = createElement(classNames, text + options);
  feed.appendChild(message);
}
