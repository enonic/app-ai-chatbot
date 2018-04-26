FROM python:3

ADD rasa /rasa

# RUN pip install rasa_nlu[spacy]==0.9.2 rasa-core==0.8.6 spacy==2.0.11 klein==17.10.0
RUN pip install rasa-core==0.8.6 spacy==2.0.11 klein==17.10.0 sklearn-crfsuite==0.3.6
RUN python -m spacy download en_core_web_md
RUN python -m spacy link en_core_web_md en

WORKDIR /rasa
EXPOSE 7454
CMD python -m rasa_core.server -d models/stories -u models/nlu/default/current -p 7454 --cors [*] -o logs/server.log --debug -v
