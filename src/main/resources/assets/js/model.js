var templates = {
    utter_greet: {says: ['hey there!']},
    utter_goodbye: {says: ['Bye-bye']},
    utter_default: {says: ['default message']},
    utter_ack_dosearch: {says: ['ok let me see what I can find']},
    utter_ack_findalternatives: {says: ['ok let me see what else there is']},
    utter_ack_makereservation: {
        says: ['ok making a reservation'],
        reply: [
            {
                question: "thank you",
                answer: "thankyouHandler"
            }
        ]
    },
    utter_ask_cuisine: {says: ['what kind of cuisine would you like?']},
    utter_ask_howcanhelp: {says: ['how can I help you?']},
    utter_ask_location: {says: ['where?']},
    utter_ask_moreupdates: {says: ['if you\'d like to modify anything else, please tell me what']},
    utter_ask_numpeople: {says: ['for how many people?']},
    utter_ask_price: {
        says: ['in which price range?'],
        reply: [
            {
                question: 'cheap',
                answer: 'cheapOptionEvents'
            },
            {
                question: 'expensive',
                answer: 'expensiveOptionEvents'
            }
        ]
    },
    utter_on_it: {says: ['I\'m on it']}
};

cheapOptionEvents = function cheapOptionEvents() {
    notifyButtonClick({"event": "slot", "name": "price", "value": "cheap"});
}

 expensiveOptionEvents = function expensiveOptionEvents() {
    notifyButtonClick({"event": "slot", "name": "price", "value": "expensive"});
}


var buttonClickListeners = [];

function onButtonClick(callback) {
    buttonClickListeners.push(callback);
}

function unButtonClick(callback) {
    buttonClickListeners = buttonClickListeners.filter(function (current) {
        return current !== callback;
    });
}

function notifyButtonClick(json) {
    for (var i = 0; i < buttonClickListeners.length; i++) {
        buttonClickListeners[i](json);
    }
}

module.exports = {
    templates: templates,
    onButtonClick: onButtonClick,
    unButtonClick: unButtonClick
}