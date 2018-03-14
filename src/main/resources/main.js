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

var forwardToRasa = function (request) {
    var q = request.params["query"];
    var rasaUrl = helper.getRasaUrl();
    log.info('>>> RASA URL <<< : [' + rasaUrl + '] ? query = "' + q + '"');
    var rasaResponse = httpClient.request({
        url: rasaUrl,
        method: 'POST',
        headers: {
            'Cache-Control': 'no-cache',
            'Accept': '*/*'
        },
        connectionTimeout: 20000,
        readTimeout: 5000,
        body: '{"query": "' + q + '"}',
        contentType: 'text/plain'
    });
    log.info('>>> RASA RESPONSE <<< : [' + JSON.stringify(rasaResponse) + ']');
    return {
        body: rasaResponse,
        contentType: 'application/json'
    }
};

router.get('/', renderPage('main.html'));

router.get('/sw.js', swController.get);

router.post('/', forwardToRasa);

exports.all = function (req) {
    return router.dispatch(req);
};
