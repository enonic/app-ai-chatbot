var mustacheLib = require('/lib/xp/mustache');
var httpClient = require('/lib/http-client');
var router = require('/lib/router')();
var helper = require('/lib/helper');
var init = require('/lib/init');
var repo = require('/lib/repo');
var swController = require('/lib/pwa/sw-controller');
var siteTitle = 'AI Bot';
var sessionId;

var renderPage = function(pageName) {
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
};

var sendToRasa = function(params, method, action) {
  var url = helper.getRasaUrl(sessionId) + action;

  var rasaResponse = httpClient.request({
    url: url,
    method: method,
    headers: {
      'Cache-Control': 'no-cache',
      Accept: '*/*'
    },
    connectionTimeout: 20000,
    readTimeout: 5000,
    body: JSON.stringify(params),
    contentType: 'text/plain'
  });
  return {
    body: rasaResponse,
    action: action,
    contentType: 'application/json',
    status: rasaResponse.status
  };
};

function resetSessionId() {
  sessionId = new Date().getTime();
}

function rasaParse(req) {
  var data = JSON.parse(req.params.data);
  var query = data.query;
  var body = {
    query: query
  };
  log.info('RASA PARSE >>> query: ' + query);
  return sendToRasa(body, 'POST', 'parse');
}

function rasaContinue(req) {
  var data = JSON.parse(req.params.data);
  var action = data.action;
  var events = data.events || [];
  var body = {
    executed_action: action,
    events: events
  };

  log.info(
    'RASA CONTINUE >>> executed_action: ' +
      action +
      ', events: ' +
      JSON.stringify(events)
  );

  return sendToRasa(body, 'POST', 'continue');
}

function rasaInit() {
  resetSessionId();
  log.info('Setting session id: ' + sessionId);
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
  repo.saveMessage(message);
}

init.initialize();

router.get('/', renderPage('main.html'));

router.get('/sw.js', swController.get);
router.get('/history', getHistory);
router.post('/history', updateHistory);

router.post('/rasa/parse', rasaParse);
router.post('/rasa/continue', rasaContinue);
router.post('/rasa/init', rasaInit);

exports.all = function(req) {
  return router.dispatch(req);
};
