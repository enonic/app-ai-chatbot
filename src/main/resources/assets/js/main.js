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
        if ('application/json' == jsonResponse.contentType) {

            var action = JSON.parse(jsonResponse.body).next_action;

            chatWindow.talk(
                {
                    ice: {
                        says: [action]/*,
                    reply: [
                        {
                            question: "1 option",
                            answer: "firstOptionHandler"
                        },
                        {
                            question: "2 option",
                            answer: "secondOptionHandler"
                        }
                    ]*/
                    }

                })

            if (!rasa.actions.ACTION_LISTEN == action) {
                rasa.action(action);
            }

        }

    });

    chatWindow.talk(
        {
            "ice": {
                "says": ["HI!", "How can I help you?"]
            }
        }
    );
})();



