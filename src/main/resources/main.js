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

var sendToRasa = function (url, params, method) {
    var rasaResponse = httpClient.request({
        url: url,
        method: method,
        headers: {
            'Cache-Control': 'no-cache',
            'Accept': '*/*'
        },
        connectionTimeout: 20000,
        readTimeout: 5000,
        body: params,
        contentType: 'text/plain'
    });
    return {
        body: rasaResponse,
        contentType: 'application/json'
    }
};

var rasaParse = function (req) {
    var q = req.params["query"];
    var url = helper.getRasaUrl() + 'parse';
    var body = '{"query": "' + q + '"}';
    return sendToRasa(url, body, 'POST');
};

function rasaContinue(req) {
    var a = req.params["action"];
    var e = req.params["events"];
    var url = helper.getRasaUrl() + 'continue';
    var body = '{"executed_action": "' + a + '", "events": ' + JSON.stringify(e) + '}';
    return sendToRasa(url, body, 'POST');
}

router.get('/', renderPage('main.html'));

router.get('/sw.js', swController.get);

router.post('/rasa/parse', rasaParse);
router.post('/rasa/continue', rasaContinue);

exports.all = function (req) {
    return router.dispatch(req);
};
