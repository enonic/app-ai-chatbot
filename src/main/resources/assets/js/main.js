require('../css/styles.less');
var chat = require('../js/bubble/Bubbles');
var rasa = require('../js/rasa');


(function () {

    var chatWindow = window.chatWindow = new chat.Bubbles(document.getElementById("chat"), "chatWindow", {
        inputCallbackFn: function (o) {
            rasa.message(o.input);
        }
    });

    rasa.restart();

    rasa.onResponse(function (jsonResponse) {
        if (jsonResponse.status !== 200) {
            return;
        }

        var nextAction = JSON.parse(jsonResponse.body).next_action;

        if (nextAction && rasa.actions.ACTION_LISTEN !== nextAction) {
            chatWindow.talk(
                {
                    ice: {
                        says: [nextAction]/*,
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

                });
            rasa.action(nextAction);
        } else {
            console.log('RASA: ' + nextAction);
        }

    });

    chatWindow.talk(
        {
            "ice": {
                "says": ["Hi there!"]
            }
        }
    );
})();



