require('../css/styles.less');
var chat = require('../js/bubble/Bubbles');
var rasa = require('../js/rasa');
var model = require('../js/model');


(function () {

    var prevAction;

    var chatWindow = window.chatWindow = new chat.Bubbles(document.getElementById("chat"), "chatWindow", {
        inputCallbackFn: function (o) {
            rasa.message(o.input);
        }
    });

    model.onButtonClick(function (response) {
        rasa.action(prevAction, response);
    });

    rasa.restart();

    rasa.onResponse(function (jsonResponse) {
        if (jsonResponse.status !== 200) {
            return;
        }

        var nextAction = JSON.parse(jsonResponse.body).next_action;

        var template = getTemplateForRasaAction(nextAction);

        if (template && rasa.actions.ACTION_LISTEN !== nextAction) {
            chatWindow.talk({ice: template});
           if(rasa.actions.ASK_PRICE != nextAction) {//TODO: check all actions with buttons
                rasa.action(nextAction);
           } else {
               prevAction = nextAction;
           }
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

    function getTemplateForRasaAction(action) {
        var template = model.templates[action];

        return template || null;

    }
})();
