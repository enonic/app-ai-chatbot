var nodeLib = require('/lib/xp/node');
var authLib = require('/lib/xp/auth');
var valueLib = require('/lib/xp/value');

var REPO_NAME = 'aichatbot';
var LOGS_PATH = '/logs';

var ROOT_PERMISSIONS = [
  {
    principal: 'role:system.everyone',
    allow: [
      'READ',
      'CREATE',
      'MODIFY',
      'DELETE',
      'PUBLISH',
      'READ_PERMISSIONS',
      'WRITE_PERMISSIONS'
    ],
    deny: []
  }
];

function connect() {
  return nodeLib.connect({
    repoId: REPO_NAME,
    branch: 'master'
  });
}

function getMessageNode(repoConn, user) {
  var queryResult = repoConn.query({
    start: 0,
    count: 1,
    query: 'user = "' + user.key + '"'
  });

  if (queryResult.count > 0) {
    return repoConn.get(queryResult.hits[0].id);
  }

  return null;
}

function convertMessage(message, user) {
  return {
    user: message.isBot ? 'bot' : user.key,
    dateTime: valueLib.localDateTime(new Date()),
    text: message.text
  };
}

function doSaveMessage(message, user) {
  var repoConn = connect();
  var messageNode = getMessageNode(repoConn, user);
  var convertedMessage = convertMessage(message, user);

  log.info('Saving ' + JSON.stringify(message));

  if (messageNode) {
    log.info('Node exists. Updating');
    repoConn.modify({
      key: messageNode._id,
      editor: function(node) {
        // eslint-disable-next-line no-param-reassign
        node.log = [].concat(node.log, convertedMessage);
        return node;
      }
    });
  } else {
    log.info('Node does not exist. Creating');
    repoConn.create({
      _parentPath: LOGS_PATH,
      _permissions: ROOT_PERMISSIONS,
      log: [convertedMessage],
      user: user.key
    });
  }
}

function saveMessage(message) {
  var user = authLib.getUser();

  if (!user) {
    log.info('Unable to define user; Message will not be saved');
    return;
  }

  doSaveMessage(message, user);
}

function doLoadHistory(user) {
  var repoConn = connect();
  var messageNode = getMessageNode(repoConn, user);

  if (messageNode) {
    return messageNode.log;
  }

  return null;
}

function loadHistory() {
  var user = authLib.getUser();

  if (!user) {
    log.info('Unable to define user; No message history to load');
    return null;
  }

  return doLoadHistory(user);
}

exports.saveMessage = saveMessage;
exports.loadHistory = loadHistory;
exports.connect = connect;
exports.REPO_NAME = REPO_NAME;
exports.LOGS_PATH = LOGS_PATH;
exports.ROOT_PERMISSIONS = ROOT_PERMISSIONS;
