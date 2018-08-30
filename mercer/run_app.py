from rasa_core.agent import Agent
from rasa_core.channels import HttpInputChannel
from rasa_core.channels.slack import SlackInput
from rasa_core.interpreter import RasaNLUInterpreter

nlu_interpreter = RasaNLUInterpreter('./models/current/nlu')
# load your trained agent
agent = Agent.load("./models/current/dialogue", interpreter=nlu_interpreter)

input_channel = SlackInput(
    slack_token="xoxb-377921613652-402816245856-xv57eVBvtyfrGyrxrhrmIiWS",  # this is the `bot_user_o_auth_access_token`
    slack_channel="@sirotabot"  # the name of your channel to which the bot posts (optional)
)

agent.handle_channel(HttpInputChannel(5004, "/", input_channel))
