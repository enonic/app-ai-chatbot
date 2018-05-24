var mustacheLib = require('/lib/xp/mustache');
var httpClient = require('/lib/http-client');
var router = require('/lib/router')();
var helper = require('/lib/helper');
var init = require('/lib/init');
var repo = require('/lib/repo');
var swController = require('/lib/pwa/sw-controller');
var templates = require('/lib/templates');
var authLib = require('/lib/xp/auth');

var siteTitle = 'AI Bot';
var RASA_ACTIONS = {
  LISTEN: 'action_listen',
  RESTART: 'action_restart'
};
var XP_ACTIONS = require('/lib/actions');

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
  log.info('RASA PAYLOAD: action=' + action + ', body=' + JSON.stringify(body));
  return httpClient.request({
    url: helper.getRasaUrl(sender) + action,
    method: method || 'POST',
    headers: {
      'Cache-Control': 'no-cache',
      Accept: '*/*'
    },
    connectionTimeout: 20000,
    readTimeout: 5000,
    body: body ? JSON.stringify(body) : undefined,
    contentType: 'application/json'
  });
}

function getCustomActionHandler(action) {
  return XP_ACTIONS[action];
}

function isWaitingForUserInput(action) {
  return action === RASA_ACTIONS.LISTEN;
}

function isRestartAction(action) {
  return action === RASA_ACTIONS.RESTART;
}

function resolveMessageForAction(action) {
  // TODO: do localization here
  var templateAction = templates[action];
  if (!templateAction) {
    log.warning('Missing template for action: %s', action);
  }
  return templateAction
    ? templateAction.text
    : 'NOT_TRANSLATED&lt;' + action + '&gt;';
}

// eslint-disable-next-line no-unused-vars
function resolveButtonsForAction(action) {
  var templateAction = templates[action];
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

function getAllMessagesFromRasa(query, sender) {
  var messages = [];
  var rasaResponse = sendToRasaServer(sender, 'parse', { query: query });
  var responseBody = JSON.parse(rasaResponse.body);
  var action = responseBody.next_action;
  // eslint-disable-next-line no-unused-vars
  var events;
  var actionHandler;
  var actionResult;
  var isRestarted;
  var counter = 0;

  while (rasaResponse.status === 200 && !isWaitingForUserInput(action)) {
    log.info('RASA NEXT ACTION: ' + action);
    actionHandler = getCustomActionHandler(action);
    if (actionHandler) {
      actionResult = actionHandler(responseBody.tracker);
    }

    isRestarted = isRestartAction(action);
    messages.push({
      text: actionResult ? actionResult.text : resolveMessageForAction(action),
      buttons: actionResult
        ? actionResult.options
        : resolveButtonsForAction(action),
      restarted: isRestarted
    });

    if (isRestarted) {
      events = [{ event: 'restart' }];
    }

    rasaResponse = doRasaContinue(sender, action, events);
    action = JSON.parse(rasaResponse.body).next_action;

    counter += 1;
    if (counter >= 10) {
      break;
    }
  }
  log.info('RASA FINISH ACTION: ' + action);

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

exports.all = function(req) {
  return router.dispatch(req);
};
