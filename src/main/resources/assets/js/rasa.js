let responseListeners = [];

const actions = {
  ACTION_LISTEN: 'action_listen',
  ASK_PRICE: 'utter_ask_price'
};

function postAjax(url, data, success) {
  const params = `data=${JSON.stringify(data)}`;

  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.onreadystatechange = () => {
    if (xhr.readyState > 3 && xhr.status === 200) {
      success(JSON.parse(xhr.responseText));
    }
  };
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', '*/*');
  xhr.send(params);
  return xhr;
}

function notifyResponse(json) {
  console.log('Response from rasa', json);
  responseListeners.forEach(listener => listener(json));
}

function message(query) {
  // eslint-disable-next-line no-undef
  postAjax(`${appUrl}/rasa/parse`, { query }, notifyResponse);
}

function action(a, events) {
  const data = {};
  if (a) {
    data.action = a;
  }
  if (events) {
    data.events = [].concat(events);
  }
  // eslint-disable-next-line no-undef
  postAjax(`${appUrl}/rasa/continue`, data, notifyResponse);
}

function restart() {
  action(actions.ACTION_LISTEN, { event: 'restart' });
}

function init() {
  const xhr = new XMLHttpRequest();
  // eslint-disable-next-line no-undef
  xhr.open('GET', `${appUrl}/rasa/init`);
  xhr.send();
}

function onResponse(callback) {
  responseListeners.push(callback);
}

function unResponse(callback) {
  responseListeners = responseListeners.filter(current => current !== callback);
}

module.exports = {
  message,
  action,
  restart,
  init,
  actions,
  onResponse,
  unResponse
};
