function loadHistory(historyLoadedHandler) {
  const xhr = new XMLHttpRequest();
  // eslint-disable-next-line no-undef
  xhr.open('GET', `${appUrl}/history`);
  xhr.onreadystatechange = () => {
    if (xhr.readyState > 3 && xhr.status === 200) {
      historyLoadedHandler(JSON.parse(xhr.responseText));
    }
  };
  xhr.send(null);
}

function updateHistory(message) {
  const params = `data=${JSON.stringify(message)}`;

  const xhr = new XMLHttpRequest();
  // eslint-disable-next-line no-undef
  xhr.open('POST', `${appUrl}/history`);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', '*/*');
  xhr.send(params);
}

module.exports = {
  loadHistory,
  updateHistory
};
