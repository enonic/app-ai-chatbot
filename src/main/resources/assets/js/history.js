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

function sendHistoryUpdate(senderId, message) {
  const params = `senderId=${senderId}&data=${JSON.stringify(message)}`;

  const xhr = new XMLHttpRequest();
  // eslint-disable-next-line no-undef
  xhr.open('POST', `${appUrl}/history`);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', '*/*');
  xhr.send(params);

  return xhr;
}

const queue = [];
let isUpdating = false;

function updateHistory(senderId, message) {
  if (isUpdating) {
    queue.push({ senderId, message });
    return;
  }

  isUpdating = true;
  const xhr = sendHistoryUpdate(senderId, message);

  xhr.onreadystatechange = () => {
    if (xhr.readyState > 3 && xhr.status === 200) {
      isUpdating = false;
      if (queue.length > 0) {
        const notification = queue.shift();
        updateHistory(notification.senderId, notification.message);
      }
    }
  };
}

module.exports = {
  loadHistory,
  updateHistory
};
