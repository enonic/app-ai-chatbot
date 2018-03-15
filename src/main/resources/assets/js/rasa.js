function postAjax(url, data, success) {
    var params = "data=" + JSON.stringify(data);

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState > 3 && xhr.status == 200) {
            success(JSON.parse(xhr.responseText));
        }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Accept', '*/*');
    xhr.send(params);
    return xhr;
}

function message(message) {
    postAjax(appUrl + '/rasa/parse', {query: message}, notifyResponse);
}

function action(action, events) {
    var data = {};
    if (action) {
        data.action = action;
    }
    if (events) {
        data.events = [].concat(events);
    }
    postAjax(appUrl + '/rasa/continue', data, notifyResponse);
}

function restart() {
    action(actions.ACTION_LISTEN, {"event": "restart"});
}

var responseListeners = [];

function notifyResponse(json) {
    console.log('Response from rasa', json);
    for (var i = 0; i < responseListeners.length; i++) {
        responseListeners[i](json);
    }
}

function onResponse(callback) {
    responseListeners.push(callback);
}

function unResponse(callback) {
    responseListeners = responseListeners.filter(function (current) {
        return current !== callback;
    });
}

var actions = {
    ACTION_LISTEN: 'action_listen'
};

module.exports = {
    message: message,
    action: action,
    restart: restart,
    actions: actions,
    onResponse: onResponse,
    unResponse: unResponse
};
