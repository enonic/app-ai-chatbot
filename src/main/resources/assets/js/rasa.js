let responseListeners = [];
const sender = Date.now();

function ajax(url, method, data, success) {
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
  console.log('Response from rasa', json);
  responseListeners.forEach(listener => listener(json));
}

function message(query) {
  // eslint-disable-next-line no-undef
  ajax(`${appUrl}/rasa/parse`, 'POST', { query, sender }, notifyResponse);
}

function onResponse(callback) {
  responseListeners.push(callback);
}

function unResponse(callback) {
  responseListeners = responseListeners.filter(current => current !== callback);
}

module.exports = {
  message,
  onResponse,
  unResponse
};
