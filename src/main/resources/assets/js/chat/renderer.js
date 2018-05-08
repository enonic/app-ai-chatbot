import autoresize from 'autoresize';
import throttle from './utils';
import { messageType } from './config';

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

const getFeed = element => element.querySelector('.chat-message-feed');
const getWrapper = () => document.querySelector('.chat-wrapper');
const getUserInput = element => element.querySelector('.chat-input');
const getTextArea = element => element.querySelector('.chat-input__input');
const getSendButton = element => element.querySelector('.chat-input__send');

export function toggleOnlineStatus(online, wrapper) {
  if (!wrapper) {
    // eslint-disable-next-line no-param-reassign
    wrapper = getWrapper();
  }
  const textarea = getTextArea(wrapper);
  const sendButton = getSendButton(wrapper);

  const isOnline = online !== false && navigator.onLine;
  if (isOnline) {
    wrapper.classList.remove('offline');
  } else {
    wrapper.classList.add('offline');
  }
  textarea.disabled = !isOnline;
  sendButton.disabled = !isOnline;
}

function addStatusEventListeners(wrapper) {
  window.addEventListener(
    'offline',
    toggleOnlineStatus.bind(undefined, wrapper)
  );
  window.addEventListener(
    'online',
    toggleOnlineStatus.bind(undefined, wrapper)
  );

  toggleOnlineStatus(undefined, wrapper);
}

function addInputEventListeners(wrapper, sendCallback) {
  const textarea = getTextArea(wrapper);
  const sendButton = getSendButton(wrapper);
  const input = getUserInput(wrapper);
  const feed = getFeed(wrapper);

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
        lastMessage.remove();
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

  sendButton.addEventListener('click', send);
}

function addFeedEventListeners(bot, sendCallback) {
  const feed = getFeed(bot);
  feed.addEventListener('click', event => {
    const { target } = event;
    const isOption = target.classList.contains(
      'chat-message-feed__message-option'
    );
    if (isOption) {
      const text = target.innerHTML;
      const message = target.parentElement.parentElement;
      target.parentElement.parentElement.remove();
      message.classList.remove('chat-message-feed__message--reply');
      sendCallback(text);
    }
  });
}

export function renderBot(sendCallback) {
  const wrapper = createElement('chat-wrapper');
  wrapper.innerHTML = `
  <div class="chat-status-bar">
    <span class="chat-status-bar__status chat-online-text">Online</span>
    <span class="chat-status-bar__status chat-offline-text">Server unavailable…</span>
  </div>
  <div class="chat-placeholder">
    <div class="chat-message-feed"></div>
    <div class="chat-input chat-input--empty">
      <textarea class='chat-input__input' autofocus rows="1" placeholder='Write a message…'></textarea>
      <button class="chat-input__send" name="Send"></button>
    </div>
  </div>
  `;

  addStatusEventListeners(wrapper);
  addFeedEventListeners(wrapper, sendCallback);
  addInputEventListeners(wrapper, sendCallback);

  return wrapper;
}

export function renderSeparator(bot) {
  const feed = getFeed(bot);
  feed.appendChild(createElement('chat-message-feed__separator', '<hr/>'));
  feed.scrollTop = feed.scrollHeight;
}

export function renderMessage(bot, say, reply, type) {
  const feed = getFeed(bot);
  const hasReply = !!reply && reply.length > 0;
  const scrolledTillEnd =
    feed.offsetHeight + feed.scrollTop >= feed.scrollHeight;
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
  if (scrolledTillEnd || type === messageType.SELF) {
    feed.scrollTop = feed.scrollHeight;
  }
}
