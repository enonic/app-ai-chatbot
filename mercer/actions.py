from rasa_core.actions import Action
from rasa_core.events import SlotSet


class AskSurveyQuestion(Action):

    def name(self):
        return "ask_survey_question"

    def run(self, dispatcher, tracker, domain):

        last_response = tracker.get_slot('survey_choice')
        qno = tracker.get_slot('qnumber')
        user = tracker.get_slot('name')

        if qno <= 5.0:
            if qno == 1.0:
                question = 'Excellent thanks. \nMy company acts in a socially responsible way in the communities in which it operates.'
            elif qno == 2.0:
                question = "Thank you. \nThe company's mission is important to me."
            elif qno == 3.0:
                question = "You're doing well. Two left to rate! \nThe company is effective in converting great ideas into great solutions"
            elif qno == 4.0:
                question = 'My job gives me a sense of meaning and purpose'
            else:
                question = '(not needed)'

            dispatcher.utter_template("utter_ask_the_q", tracker)
            qno += 1.0

        else:
            dispatcher.utter_template("utter_goodbye", tracker)
            question = "(not needed)"
        return [SlotSet("qtext", question if question is not None else []), SlotSet("qnumber", qno if qno is not None else [])]
