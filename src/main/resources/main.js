var mustacheLib = require('/lib/xp/mustache');
var httpClient = require('/lib/http-client');
var router = require('/lib/router')();
var helper = require('/lib/helper');
var init = require('/lib/init');
var repo = require('/lib/repo');
var swController = require('/lib/pwa/sw-controller');
var siteTitle = 'AI Bot';

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

var sendToRasaCore = function(query, sender) {
  var rasaResponse = httpClient.request({
    url: helper.getRasaUrl(),
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache',
      Accept: '*/*'
    },
    connectionTimeout: 20000,
    readTimeout: 5000,
    body: JSON.stringify({
      message: query,
      sender: sender
    }),
    contentType: 'application/json'
  });
  log.info('RASA RESPONSE >>> ' + JSON.stringify(rasaResponse));
  return {
    body: rasaResponse.body,
    contentType: 'application/json',
    status: rasaResponse.status
  };
};

function rasaParse(req) {
  var data = JSON.parse(req.params.data);
  var query = data.query;
  var sender = data.sender;
  return sendToRasaCore(query, sender);
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

exports.all = function(req) {
  return router.dispatch(req);
};
