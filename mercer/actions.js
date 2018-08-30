function askQuestion(tracker) {
  var slots = tracker.slots;

  var qno = slots.qnumber;
  var question;
  var template;

  if (qno <= 5) {
    switch (qno) {
      case 1:
        question = 'Excellent thanks. \nMy company acts in a socially responsible way in the communities in which it operates.';
        break;
      case 2:
        question = "Thank you. \nThe company's mission is important to me.";
        break;
      case 3:
        question = "You're doing well. Two left to rate! \nThe company is effective in converting great ideas into great solutions";
        break;
      case 4:
        question = 'My job gives me a sense of meaning and purpose';
        break;
      default:
        question = '(not needed)';
        break;
    }
    template = 'utter_ask_the_q';
    qno += 1.0;
  } else {
    template = 'utter_goodbye';
    question = '(not needed)';
  }
  return {
    template: template,
    slots: {
      qtext: question,
      qnumber: qno
    }
  };
}

module.exports = {
  ask_survey_question: askQuestion
};
