module.exports = {
  utter_greet: { text: ['Hey there!'] },
  utter_goodbye: { text: ['Bye-bye!'] },
  utter_default: { text: ['default message'] },
  utter_ack_dosearch: { text: ['Okay, let me see what I can find.'] },
  utter_ack_findalternatives: { text: ['Okay, let me see what else there is'] },
  utter_ack_makereservation: {
    text: ['Okay, making a reservation.'],
    options: ['Thank you!']
  },
  utter_ask_cuisine: { text: ['What kind of cuisine would you like?'] },
  utter_ask_howcanhelp: { text: ['How can I help you?'] },
  utter_ask_location: { text: ['Where?'] },
  utter_ask_moreupdates: {
    text: ["If you'd like to modify anything else, please tell me what."]
  },
  utter_ask_numpeople: { text: ['For how many people?'] },
  utter_ask_price: {
    text: ['In which price range?'],
    options: ['Cheap', 'Expensive']
  },
  utter_on_it: { text: ["I'm on it"] }
};
