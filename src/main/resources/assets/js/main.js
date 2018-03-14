require('../css/styles.less');
var chat = require('../js/bubble/Bubbles');
var rasa = require('../js/rasa');


(function () {

    debugger;
    var chatWindow = window.chatWindow = new chat.Bubbles(document.getElementById("chat"), "chatWindow", {
        inputCallbackFn: function (o) {
            debugger;
            rasa.send(o.input);
        }
    });

    rasa.onResponse = function (jsonResponse) {
        // jsonResponse = convertRasaToBubbleJson(jsonResponse)
        chatWindow.talk(jsonResponse)
    }
})();



