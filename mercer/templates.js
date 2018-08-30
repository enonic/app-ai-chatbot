module.exports = {
  utter_greet: { text: ['Hi, what is your name?'] },
  utter_okforsurvey: {
    text: ['Hey {name}! Are you free to take a survey?'],
    options: [
      { title: 'Yes!', payload: 'yes' },
      { title: 'Not now', payload: 'no' }
    ]
  },
  utter_goodbye: { text: ['Thank you very much for your time, it is appreciated. Goodbye.'] },
  utter_moreinfo: { text: ['For the last question you answered "Not at all". Please could you help me understand by typing some information?'] },
  utter_ask_the_q: {
    text: ['{qtext}'],
    options: [
      { title: 'Very much', payload: 'very' },
      { title: 'Mostly', payload: 'mostly' },
      { title: 'Not at all', payload: 'notatall' }
    ]
  }
};
