function postAjax(url, data, success) {
    var params = typeof data == 'string' ? data : Object.keys(data).map(
        function (k) {
            return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
        }
    ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState > 3 && xhr.status == 200) {
            success(JSON.parse(xhr.responseText));
        }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.setRequestHeader('Accept', '*/*');
    xhr.send(params);
    return xhr;
}

function send(message) {
    postAjax(appUrl, {q: message}, notifyResponse);
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

module.exports = {
    send: send,
    onResponse: onResponse,
    unResponse: unResponse
};
