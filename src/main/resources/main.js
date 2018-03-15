var mustacheLib = require('/lib/xp/mustache');
var httpClient = require('/lib/http-client');
var router = require('/lib/router')();
var helper = require('/lib/helper');
var swController = require('/lib/pwa/sw-controller');
var siteTitle = 'AI Bot';

var renderPage = function (pageName) {
    return function () {
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
};

var sendToRasa = function (params, method, action) {
    var rasaResponse = httpClient.request({
        url: helper.getRasaUrl() + action,
        method: method,
        headers: {
            'Cache-Control': 'no-cache',
            'Accept': '*/*'
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
    }
};

var rasaParse = function (req) {
    var data = JSON.parse(req.params["data"]);
    var query = data.query;
    var body = {
        "query": query
    };
    log.info('RASA PARSE >>> query: ' + query);
    return sendToRasa(body, 'POST', 'parse');
};

function rasaContinue(req) {
    var data = JSON.parse(req.params["data"]);
    var action = data.action;
    var events = data.events || [];
    log.info('RASA CONTINUE >>> action: ' + action + ', events: ' + JSON.stringify(events));
    var body = {
        "executed_action": action,
        "events": events
    };
    return sendToRasa(body, 'POST', 'continue');
}

router.get('/', renderPage('main.html'));

router.get('/sw.js', swController.get);

router.post('/rasa/parse', rasaParse);
router.post('/rasa/continue', rasaContinue);

exports.all = function (req) {
    return router.dispatch(req);
};
