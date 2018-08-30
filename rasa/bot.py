from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import argparse
import logging
import warnings

from flask import Blueprint, request, jsonify
from policy import RestaurantPolicy
from rasa_core import utils
from rasa_core.actions import Action
from rasa_core.agent import Agent
from rasa_core.channels import HttpInputChannel
from rasa_core.channels.channel import UserMessage
from rasa_core.channels.console import ConsoleInputChannel
from rasa_core.channels.direct import CollectingOutputChannel
from rasa_core.channels.rest import HttpInputComponent
from rasa_core.events import SlotSet
from rasa_core.interpreter import RasaNLUInterpreter
from rasa_core.policies.memoization import MemoizationPolicy

logger = logging.getLogger(__name__)


class RestaurantAPI:
    def __init__(self):
        pass

    def search(self, cuisine, location, people, price, info):
        logger.info("RestaurantAPI.search: cuisine=%s, location=%s, people=%s, price=%s, info=%s", cuisine, location, people, price, info)
        query = ("Cheap " if price == "lo" else "Expensive " if price == "hi" else "") + \
                ("local" if cuisine is None else cuisine) + " restaurant " + \
                ("nearby" if location is None else "in " + location) + " " + \
                ("" if people is None else "for " + people + " ") + \
                ("" if info is None else "and " + info)
        return "<a href='http://www.google.com/search?q=" + query + "' target='_blank'>" + query + "</a>"


class ActionSearchRestaurants(Action):
    def name(self):
        return 'action_search_restaurants'

    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message("looking for restaurants")
        restaurant_api = RestaurantAPI()
        restaurants = restaurant_api.search(tracker.get_slot("cuisine"), tracker.get_slot("location"), tracker.get_slot("people"),
                                            tracker.get_slot("price"), tracker.get_slot("info"))
        return [SlotSet("matches", restaurants)]


class ActionSuggest(Action):
    def name(self):
        return 'action_suggest'

    def run(self, dispatcher, tracker, domain):
        dispatcher.utter_message("here's what I found:")
        dispatcher.utter_message(tracker.get_slot("matches"))
        dispatcher.utter_message("is it ok for you? "
                                 "hint: I'm not going to "
                                 "find anything else :)")
        return []


def train_stories(domain_file="domain.yml",
                  model_path="models/current/dialogue",
                  training_data_file="data/stories.md"):
    agent = Agent(domain_file,
                  policies=[MemoizationPolicy(max_history=3),
                            RestaurantPolicy()])

    training_data = agent.load_data(training_data_file)
    agent.train(
        training_data,
        epochs=400,
        batch_size=100,
        validation_split=0.2
    )

    agent.persist(model_path)
    return agent


def train_nlu():
    from rasa_nlu.training_data import load_data
    from rasa_nlu.model import Trainer
    from rasa_nlu import config

    training_data = load_data('data/testdata.json')
    trainer = Trainer(config.load("nlu_config.yml"))
    trainer.train(training_data)
    model_directory = trainer.persist('models/nlu', fixed_model_name="nlu",
                                      project_name="current")  # Returns the directory the model is stored in

    return model_directory


def console(serve_forever=True):
    interpreter = RasaNLUInterpreter("models/current/nlu")
    agent = Agent.load("models/current/dialogues", interpreter=interpreter)

    if serve_forever:
        agent.handle_channel(ConsoleInputChannel())
    return agent


class SimpleWebBot(HttpInputComponent):
    """A simple web bot that listens on a url and responds."""

    def blueprint(self, on_new_message):
        custom_webhook = Blueprint('custom_webhook', __name__)

        @custom_webhook.route("/status", methods=['GET'])
        def health():
            return jsonify({"status": "ok"})

        @custom_webhook.route("", methods=['POST'])
        def receive():
            payload = request.json
            sender_id = payload.get("sender", None)
            text = payload.get("message", None)
            out = CollectingOutputChannel()
            on_new_message(UserMessage(text, out, sender_id))
            responses = [m for _, m in out.messages]
            return jsonify(responses)

        return custom_webhook


def server(serve_forever=True):
    # path to your NLU model
    interpreter = RasaNLUInterpreter("models/nlu/default/current")
    # path to your dialogues models
    agent = Agent.load("models/stories", interpreter=interpreter)
    # http api endpoint for responses
    input_channel = SimpleWebBot()
    if serve_forever:
        agent.handle_channel(HttpInputChannel(7454, "/bot", input_channel))
    return agent


if __name__ == '__main__':
    utils.configure_colored_logging(loglevel="INFO")

    parser = argparse.ArgumentParser(
        description='starts the bot')

    parser.add_argument(
        'task',
        choices=["train-nlu", "train-stories", "server", "console"],
        help="what the bot should do - e.g. run or train?")

    parser.add_argument("-r", "--remote", dest="remote", default=False,
                        help="write report to FILE", metavar="FILE")

    args = parser.parse_args()
    task = args.task

    # decide what to do based on first parameter of the script
    if task == "train-nlu":
        train_nlu()
    elif task == "train-stories":
        train_stories()
    elif task == "server":
        server()
    elif task == 'console':
        console()
    else:
        warnings.warn("Need to pass either 'train-nlu', 'train-stories', 'console' or 'server' to use the script.")
        exit(1)
