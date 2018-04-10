var nodeLib = require('/lib/xp/node');
var authLib = require('/lib/xp/auth');
var valueLib = require('/lib/xp/value');

var REPO_NAME = 'aichatbot';
var LOGS_PATH = '/history';

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

function convertMessage(message, user) {
  return {
    author: message.isBot ? 'bot' : user.key,
    created: valueLib.localDateTime(new Date()),
    text: message.text
  };
}

function createUserNode(repoConn, userId) {
  return repoConn.create({
    _parentPath: LOGS_PATH,
    _permissions: ROOT_PERMISSIONS,
    userId: userId
  });
}

function createConversationNode(repoConn, userNode, senderId) {
  return repoConn.create({
    _parentPath: userNode._path,
    _permissions: ROOT_PERMISSIONS,
    conversationId: senderId
  });
}

function createMessageNode(repoConn, conversationNode, convertedMessage) {
  return repoConn.create({
    _parentPath: conversationNode._path,
    _permissions: ROOT_PERMISSIONS,
    log: [{ messages: [convertedMessage] }]
  });
}

function updateMessageNode(repoConn, key, isNew, convertedMessage) {
  repoConn.modify({
    key: key,
    editor: function(node) {
      // eslint-disable-next-line no-unused-expressions
      isNew // eslint-disable-next-line no-param-reassign
        ? (node.log = [].concat(node.log, {
            messages: [convertedMessage]
          })) // eslint-disable-next-line no-param-reassign
        : (node.log = [].concat([].concat(node.log).slice(0, -1), {
            messages: [
              [].concat(node.log)[[].concat(node.log).length - 1].messages,
              convertedMessage
            ]
          }));
      return node;
    }
  });
}

function getUserNode(repoConn, userId) {
  var queryResult = repoConn.query({
    start: 0,
    count: 1,
    query: '_parentPath = "' + LOGS_PATH + '" and userId = "' + userId + '"'
  });

  if (queryResult.count > 0) {
    return repoConn.get(queryResult.hits[0].id);
  }

  return null;
}

function getConversationNode(repoConn, userNode, conversationId) {
  var queryResult = repoConn.query({
    start: 0,
    count: 1,
    query:
      '_parentPath = "' +
      userNode._path +
      '" and conversationId = "' +
      conversationId +
      '"'
  });

  if (queryResult.count > 0) {
    return repoConn.get(queryResult.hits[0].id);
  }

  return null;
}

function getMessageNode(repoConn, conversationNode) {
  var queryResult = repoConn.query({
    start: 0,
    count: 1,
    query: '_parentPath = "' + conversationNode._path + '"'
  });

  if (queryResult.count > 0) {
    return repoConn.get(queryResult.hits[0].id);
  }

  return null;
}

function getMessageNodes(repoConn, userNode) {
  var queryResult = repoConn.query({
    start: 0,
    count: -1,
    query: '_parentPath LIKE "' + userNode._path + '/*"',
    sort: '_timestamp ASC'
  });

  if (queryResult.count > 0) {
    var keys = queryResult.hits.map(function(hit) {
      return hit.id;
    });
    return repoConn.get(keys);
  }

  return null;
}

function doSaveMessage(senderId, message, user) {
  var repoConn = connect();

  var userNode = getUserNode(repoConn, user.key);

  if (!userNode) {
    userNode = createUserNode(repoConn, user.key);
  }

  var conversationNode = getConversationNode(repoConn, userNode, senderId);

  if (!conversationNode) {
    conversationNode = createConversationNode(repoConn, userNode, senderId);
  }

  var messageNode = getMessageNode(repoConn, conversationNode);

  var convertedMessage = convertMessage(message, user);

  if (messageNode) {
    updateMessageNode(
      repoConn,
      messageNode._id,
      message.isNew,
      convertedMessage
    );
  } else {
    createMessageNode(repoConn, conversationNode, convertedMessage);
  }
}

function saveMessage(senderId, message) {
  var user = authLib.getUser();

  if (!user) {
    log.info('Unable to define user; Message will not be saved');
    return;
  }

  doSaveMessage(senderId, message, user);
}

function doLoadHistory(user) {
  var repoConn = connect();

  log.info('doLoadHistory');
  var userNode = getUserNode(repoConn, user.key);

  var messageNodes;

  if (userNode) {
    messageNodes = getMessageNodes(repoConn, userNode);
  }

  log.info('messageNodes ' + JSON.stringify(messageNodes));
  if (messageNodes) {
    if (Array.isArray(messageNodes)) {
      var logs = messageNodes.map(function(messageNode) {
        return Array.isArray(messageNode.log)
          ? messageNode.log
          : [messageNode.log];
      });
      return [].concat.apply([], logs);
    } else if (messageNodes.log) {
      return Array.isArray(messageNodes.log)
        ? messageNodes.log
        : [messageNodes.log];
    }
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
