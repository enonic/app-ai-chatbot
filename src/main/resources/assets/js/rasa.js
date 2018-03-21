let responseListeners = [];

const actions = {
  ACTION_LISTEN: 'action_listen',
  ASK_PRICE: 'utter_ask_price',
  ON_IT: 'utter_on_it'
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
  console.log('RASA PARSE >>> query:', query);
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
  console.log('RASA CONTINUE >>> executed_action:', data);
  // eslint-disable-next-line no-undef
  postAjax(`${appUrl}/rasa/continue`, data, notifyResponse);
}

function restart() {
  action(actions.ACTION_LISTEN, { event: 'restart' });
}

function init() {
  const xhr = new XMLHttpRequest();
  // eslint-disable-next-line no-undef
  xhr.open('POST', `${appUrl}/rasa/init`);
  xhr.setRequestHeader('Cache-Control', 'no-cache');
  xhr.setRequestHeader('Pragma', 'no-cache');
  xhr.setRequestHeader('Accept', '*/*');
  xhr.send(null);
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
