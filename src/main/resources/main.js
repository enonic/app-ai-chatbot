var mustacheLib = require('/lib/xp/mustache');
var httpClient = require('/lib/http-client');
var router = require('/lib/router')();
var helper = require('/lib/helper');
var init = require('/lib/init');
var repo = require('/lib/repo');
var swController = require('/lib/pwa/sw-controller');
var authLib = require('/lib/xp/auth');

var siteTitle = 'AI Bot';
var RASA_ACTIONS = {
  LISTEN: 'action_listen',
  RESTART: 'action_restart'
};
// following are copied by webpack from appropriate folder
var TEMPLATES = require('/lib/templates');
var ACTIONS = require('/lib/actions');

function renderPage(pageName) {
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
}

function sendToRasaServer(sender, action, body, method) {
  var headers = {
    'Cache-Control': 'no-cache',
    Accept: '*/*'
  };
  var authToken = helper.getAuthToken();
  if (authToken) {
    headers.Authorization = 'Bearer ' + authToken;
  }
  log.info('RASA PAYLOAD: action=' + action + ', body=' + JSON.stringify(body) + ', token=' + authToken);
  var rasaResponse = httpClient.request({
    url: helper.getRasaUrl(sender) + action,
    method: method || 'POST',
    headers: headers,
    connectionTimeout: 20000,
    readTimeout: 5000,
    body: body ? JSON.stringify(body) : undefined,
    contentType: 'application/json'
  });
  log.info('RASA RESPONSE: ' + rasaResponse.body);
  return rasaResponse;
}

function getCustomActionHandler(action) {
  return ACTIONS[action];
}

function isWaitingForUserInput(action) {
  return action === RASA_ACTIONS.LISTEN;
}

function isRestartAction(action) {
  return action === RASA_ACTIONS.RESTART;
}

function resolveMessageForAction(action, tracker) {
  // TODO: do localization here
  var templateAction = TEMPLATES[action];
  if (!templateAction) {
    log.warning('Missing template for action: %s', action);
    return 'NOT_TRANSLATED&lt;' + action + '&gt;';
  }
  log.info('RESOLED TEMPLATE FOR ACTION: ' + action + ', template: \n' + JSON.stringify(templateAction));

  return templateAction.text.map(function (text) {
    var tempText = text;
    // eslint-disable-next-line guard-for-in
    for (var slotName in tracker.slots) {
      tempText = tempText.replace(new RegExp('{(' + slotName + ')}', 'g'), tracker.slots[slotName]);
    }
    return tempText;
  });
}

// eslint-disable-next-line no-unused-vars
function resolveButtonsForAction(action) {
  var templateAction = TEMPLATES[action];
  return templateAction ? templateAction.options : undefined;
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

function resolveCustomEvents(tracker, actionResult) {
  var events = [];
  // eslint-disable-next-line guard-for-in
  for (var slotName in actionResult.slots) {
    var value = actionResult.slots[slotName];
    events.push({
      event: 'slot',
      name: slotName,
      value: value
    });
    // eslint-disable-next-line no-param-reassign
    tracker.slots[slotName] = value;
  }
  return events;
}

function processAction(action, tracker) {
  var isRestarted;
  var actionResult;
  var actionEvents;

  var actionHandler = getCustomActionHandler(action);
  if (actionHandler) {
    actionResult = actionHandler(tracker);
    log.info('CUSTOM ACTION RESULT FOR ACTION [' + action + ']: ' + JSON.stringify(actionResult));
    actionEvents = resolveCustomEvents(tracker, actionResult);
  }

  isRestarted = isRestartAction(action);

  return {
    message: {
      // eslint-disable-next-line max-len
      text: (actionResult && actionResult.text) || resolveMessageForAction((actionResult && actionResult.template) || action, tracker),
      // eslint-disable-next-line max-len
      buttons: (actionResult && actionResult.options) || resolveButtonsForAction((actionResult && actionResult.template) || action),
      restarted: isRestarted
    },
    events: isRestarted ? [{ event: 'restart' }] : actionEvents
  };
}

function getAllMessagesFromRasa(query, sender) {
  var rasaResponse = sendToRasaServer(sender, 'parse', { query: query });
  var responseBody = JSON.parse(rasaResponse.body);
  var action = responseBody.next_action;
  var messages = [];
  var prevAction;
  var totalCount = 0;
  var dupCount = 0;

  while (rasaResponse.status === 200 && !isWaitingForUserInput(action)) {
    var results;
    totalCount += 1;
    log.info('RASA NEXT ACTION: ' + action);
    if (prevAction !== action) {
      results = processAction(action, responseBody.tracker);
      messages.push(results.message);
      prevAction = action;
      dupCount = 0;
    } else {
      dupCount += 1;
      log.warning(dupCount + ' DUPLICATE ACTION, SKIPPING PROCESSING: ' + action);
      if (dupCount >= 10) {
        log.warning('5 DUPLICATE ACTIONS IN A ROW, BREAKING: ' + action);
        break;
      }
    }

    rasaResponse = doRasaContinue(sender, action, results.events);
    action = JSON.parse(rasaResponse.body).next_action;

    if (totalCount >= 10) {
      log.warning('10 ACTIONS IN A ROW WITHOUT ACTION_LISTEN, BREAKING');
      break;
    }
  }

  if (messages.length === 0) {
    messages.push({
      text: 'Not sure I understood, could you put it in the other words ?'
    });
  }

  log.info('RASA ALL ACTIONS: ' + JSON.stringify(messages));

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

function anonymousGuard() {
  var user = authLib.getUser();
  if (!user) {
    return {
      body: JSON.stringify({ redirect: true, loginUrl: helper.getLoginUrl() }),
      contentType: 'application/json',
      status: 200
    };
  }
}

function rasaParse(req) {
  var guard = anonymousGuard();
  if (guard) {
    return guard;
  }
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

// eslint-disable-next-line no-unused-vars
function serveRoot(req) {
  var user = authLib.getUser();
  if (!user) {
    return {
      redirect: helper.getLoginUrl()
    };
  }
  return renderPage('main.html');
}

// eslint-disable-next-line no-unused-vars
function rasaVersion(req) {
  var versionResponse = sendToRasaServer(null, 'version', null, 'GET');
  var versionBody = JSON.parse(versionResponse.body);
  return {
    body: JSON.stringify({
      alive: versionResponse.status === 200,
      version: versionBody.version
    }),
    contentType: 'application/json',
    status: 200
  };
}

// eslint-disable-next-line no-unused-vars
function rasaTracker(req) {
  var data = JSON.parse(req.params.data);
  var trackerResponse = sendToRasaServer(data.sender, 'tracker', null, 'GET');
  var trackerBody = JSON.parse(trackerResponse.body);
  return {
    body: trackerBody,
    contentType: 'application/json',
    status: trackerResponse.status
  };
}

init.initialize();

router.get('/', serveRoot.bind(this));
router.get('/sw.js', swController.get);
router.get('/history', getHistory);
router.post('/history', updateHistory);

router.post('/rasa/parse', rasaParse);
router.post('/rasa/version', rasaVersion);
router.post('/rasa/tracker', rasaTracker);
router.post('/rasa/continue', rasaContinue);
router.post('/rasa/results', rasaResults);

exports.all = function (req) {
  return router.dispatch(req);
};
