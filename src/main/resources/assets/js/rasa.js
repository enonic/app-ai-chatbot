let responseListeners = [];
const sender = Date.now();

const actions = {
  ACTION_LISTEN: 'action_listen',
  ASK_PRICE: 'utter_ask_price',
  ON_IT: 'utter_on_it'
};

function postAjax(url, method, data, success) {
  const params = `data=${JSON.stringify(data)}`;

  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
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
  console.log('RASA RESPONSE', json);
  responseListeners.forEach(listener => listener(json));
}

function message(query) {
  // eslint-disable-next-line no-undef
  postAjax(`${appUrl}/rasa/parse`, 'POST', { query, sender }, notifyResponse);
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
  postAjax(`${appUrl}/rasa/continue`, 'POST', data, notifyResponse);
}

function restart() {
  action(actions.ACTION_LISTEN, { event: 'restart' });
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
  actions,
  onResponse,
  unResponse
};
