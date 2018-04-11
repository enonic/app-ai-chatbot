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
    message: convertedMessage
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
  var queryStr =
    '_parentPath = "' +
    userNode._path +
    '" and conversationId = "' +
    conversationId +
    '"';
  var queryResult = repoConn.query({
    start: 0,
    count: 1,
    query: queryStr
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

  var convertedMessage = convertMessage(message, user);

  createMessageNode(repoConn, conversationNode, convertedMessage);
}

function saveMessage(senderId, message) {
  var user = authLib.getUser();

  if (!user) {
    log.info('Unable to define user; Message will not be saved');
    return;
  }

  doSaveMessage(senderId, message, user);
}

// eslint-disable-next-line
function getConversationResults(params) { // params: {userId, conversationId, startDate, endDate}
  var repoConn = connect();

  var query = '';

  if (params.userId) {
    var userNode = getUserNode(repoConn, params.userId);

    if (!userNode) {
      return [];
    }

    query += '_parentPath = "' + userNode._path + '"';
  }

  if (params.conversationId) {
    if (query.length > 0) {
      query += ' and ';
    }

    query += 'conversationId = "' + params.conversationId + '"';
  }

  if (query.length === 0) {
    query += '_parentPath like "' + LOGS_PATH + '/*"';
  }

  if (params.startDate) {
    if (query.length > 0) {
      query += ' and ';
    }

    query += '_timestamp >= "' + params.startDate + '"';
  }

  if (params.endDate) {
    if (query.length > 0) {
      query += ' and ';
    }

    query += '_timestamp <= "' + params.endDate + '"';
  }

  var queryResult = repoConn.query({
    start: 0,
    count: -1,
    query: query
  });

  var conversations = [];
  if (queryResult.count > 0) {
    var keys = queryResult.hits.map(function(hit) {
      return hit.id;
    });
    conversations = repoConn.get(keys);
  }

  if (!Array.isArray(conversations)) {
    conversations = [conversations];
  }

  return conversations.length > 0
    ? conversations
        .map(function(conversation) {
          return conversation.conversationResults;
        })
        .filter(function(result) {
          return result != null;
        })
    : [];
}

function saveConversationResults(senderId, result) {
  var repoConn = connect();

  var user = authLib.getUser();

  if (!user) {
    log.info('Unable to define user; Conversation results will not be saved');
    return;
  }

  var userNode = getUserNode(repoConn, user.key);

  if (!userNode) {
    return;
  }

  var conversationNode = getConversationNode(repoConn, userNode, senderId);

  if (conversationNode) {
    repoConn.modify({
      key: conversationNode._id,
      editor: function(node) {
        // eslint-disable-next-line no-param-reassign
        node.conversationResults = result;
        return node;
      }
    });
  }
}

function doLoadHistory(user) {
  var repoConn = connect();

  var userNode = getUserNode(repoConn, user.key);

  var messageNodes;

  if (userNode) {
    messageNodes = getMessageNodes(repoConn, userNode);
  }

  if (messageNodes) {
    if (Array.isArray(messageNodes)) {
      var logs = messageNodes.map(function(messageNode) {
        return messageNode.message;
      });
      return logs;
    } else if (messageNodes.message) {
      return [messageNodes.message];
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
exports.saveConversationResults = saveConversationResults;
exports.loadHistory = loadHistory;
exports.connect = connect;
exports.REPO_NAME = REPO_NAME;
exports.LOGS_PATH = LOGS_PATH;
exports.ROOT_PERMISSIONS = ROOT_PERMISSIONS;
