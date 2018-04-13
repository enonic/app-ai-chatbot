var mustacheLib = require('/lib/xp/mustache');
var httpClient = require('/lib/http-client');
var router = require('/lib/router')();
var helper = require('/lib/helper');
var init = require('/lib/init');
var repo = require('/lib/repo');
var swController = require('/lib/pwa/sw-controller');
var templates = require('/lib/templates');

var siteTitle = 'AI Bot';
var RASA_ACTIONS = {
  LISTEN: 'action_listen'
};

// eslint-disable-next-line no-unused-vars
function doSuggest(tracker) {
  return {
    text: 'Are you ok with that ?',
    options: ['Yes', 'No']
  };
}

function doSearchRestaurants(tracker) {
  var slots = tracker.slots;
  var query = '';
  if (slots.price) {
    query += slots.price === 'lo' ? 'Cheap ' : 'Expensive ';
  }
  if (slots.cuisine) {
    query += slots.cuisine + ' ';
  }
  query += 'restaurant ';
  if (slots.location) {
    query += 'in ' + slots.location + ' ';
  }
  if (slots.people) {
    query += 'for ' + slots.people;
  }

  repo.saveConversationResults(tracker.sender_id, slots);

  return {
    text:
      '<a href="https://www.google.com/search?q=' +
      query +
      '">' +
      query +
      '</a>'
  };
}

var XP_ACTIONS = {
  action_suggest: doSuggest,
  action_search_restaurants: doSearchRestaurants
};

function renderPage(pageName) {
  return function() {
    return {
      body: mustacheLib.render(resolve('pages/' + pageName), {
        title: siteTitle,
        version: app.version,
        appUrl: helper.getAppUrl(),
        baseUrl: helper.getBaseUrl(),
        precacheUrl: helper.getBaseUrl() + '/precache',
        themeColor: '#FFF',
        serviceWorker: mustacheLib.render(resolve('/pages/sw.html'), {
          title: siteTitle,
          baseUrl: helper.getBaseUrl(),
          precacheUrl: helper.getBaseUrl() + '/precache',
          appUrl: helper.getAppUrl()
        })
      })
    };
  };
}

function sendToRasaServer(sender, action, body, method) {
  // eslint-disable-next-line vars-on-top
  var rasaResponse = httpClient.request({
    url: helper.getRasaUrl(sender) + action,
    method: method || 'POST',
    headers: {
      'Cache-Control': 'no-cache',
      Accept: '*/*'
    },
    connectionTimeout: 20000,
    readTimeout: 5000,
    body: JSON.stringify(body),
    contentType: 'application/json'
  });
  return rasaResponse;
}

function getCustomActionHandler(action) {
  return XP_ACTIONS[action];
}

function isWaitingForUserInput(action) {
  return action === RASA_ACTIONS.LISTEN;
}

function resolveMessageForAction(action) {
  // TODO: do localization here
  return templates[action].text;
}

// eslint-disable-next-line no-unused-vars
function resolveButtonsForAction(action) {
  return templates[action].options;
}

function doRasaContinue(sender, action, events) {
  if (!action) {
    throw new Error('ERROR: rasa continue needs action');
  }
  return sendToRasaServer(sender, 'continue', {
    executed_action: action,
    events: events || []
  });
}

function getAllMessagesFromRasa(query, sender) {
  var messages = [];
  var rasaResponse = sendToRasaServer(sender, 'parse', { query: query });
  var responseBody = JSON.parse(rasaResponse.body);
  var action = responseBody.next_action;
  var actionHandler;
  var actionResult;

  while (rasaResponse.status === 200 && !isWaitingForUserInput(action)) {
    actionHandler = getCustomActionHandler(action);
    if (actionHandler) {
      actionResult = actionHandler(responseBody.tracker);
    }

    messages.push({
      text: actionResult ? actionResult.text : resolveMessageForAction(action),
      buttons: actionResult
        ? actionResult.options
        : resolveButtonsForAction(action)
    });
    rasaResponse = doRasaContinue(sender, action);
    action = JSON.parse(rasaResponse.body).next_action;
  }

  return {
    body: JSON.stringify({
      messages: messages
    }),
    contentType: 'application/json',
    status: rasaResponse.status
  };
}

function rasaContinue(req) {
  var data = JSON.parse(req.params.data);
  var action = data.action;
  var events = data.events || [];
  var sender = data.sender;
  doRasaContinue(sender, action, events);
}

function rasaResults(req) {
  var data = JSON.parse(req.params.data);
  var results = repo.getConversationResults({
    userId: data.user,
    conversationId: data.sender,
    startDate: data.start,
    endDate: data.end
  });
  return {
    body: JSON.stringify({
      results: results
    }),
    contentType: 'application/json',
    status: 200
  };
}

function rasaParse(req) {
  var data = JSON.parse(req.params.data);
  var query = data.query;
  var sender = data.sender;
  return getAllMessagesFromRasa(query, sender);
}

function getHistory() {
  var history = repo.loadHistory();

  return {
    body: JSON.stringify(history),
    contentType: 'application/json'
  };
}

function updateHistory(req) {
  var message = JSON.parse(req.params.data);
  repo.saveMessage(req.params.senderId, message);
}

init.initialize();

router.get('/', renderPage('main.html'));
router.get('/sw.js', swController.get);
router.get('/history', getHistory);
router.post('/history', updateHistory);

router.post('/rasa/parse', rasaParse);
router.post('/rasa/continue', rasaContinue);
router.post('/rasa/results', rasaResults);

exports.all = function(req) {
  return router.dispatch(req);
};
