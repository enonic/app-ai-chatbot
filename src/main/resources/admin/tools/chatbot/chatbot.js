var mustacheLib = require('/lib/xp/mustache');
var adminLib = require('/lib/xp/admin');
var helper = require('/lib/helper');

var siteTitle = 'Chat bot admin';

// eslint-disable-next-line no-unused-vars
exports.get = function(req) {
  var view = resolve('chatbot.html');
  var precacheUrl = helper.getBaseUrl() + '/precache';

  var params = {
    appUrl: helper.getAppUrl(),
    title: siteTitle,
    launcherPath: adminLib.getLauncherPath(),
    launcherUrl: adminLib.getLauncherUrl(),
    precacheUrl: precacheUrl,
    serviceWorker: mustacheLib.render(resolve('../../../pages/sw.html'), {
      title: siteTitle,
      baseUrl: helper.getBaseUrl(),
      precacheUrl: precacheUrl,
      appUrl: helper.getAppUrl()
    })
  };

  return {
    body: mustacheLib.render(view, params)
  };
};
