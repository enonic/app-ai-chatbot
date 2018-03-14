require('../css/styles.less');
var chat = require('../js/bubble/Bubbles');
var rasa = require('../js/rasa');


(function () {

    var chatWindow = window.chatWindow = new chat.Bubbles(document.getElementById("chat"), "chatWindow", {
        inputCallbackFn: function (o) {
            rasa.message(o.input);
        }
    });

    rasa.onResponse(function (jsonResponse) {
        // jsonResponse = convertRasaToBubbleJson(jsonResponse)
        chatWindow.talk(jsonResponse);
    });

    chatWindow.talk(
        {
            "ice": {
                "says": ["HI!", "How can I help you?"]
            }
        }
    );
})();



