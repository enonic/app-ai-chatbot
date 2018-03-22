var repoLib = require('/lib/xp/repo');
var contextLib = require('/lib/xp/context');
var nodeLib = require('/lib/xp/node');

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

var createRepo = function() {
  log.info('Creating repository [' + REPO_NAME + ']...');
  repoLib.create({
    id: REPO_NAME,
    rootPermissions: ROOT_PERMISSIONS
  });
  log.info('Repository created.');
};

var nodeWithPathExists = function(repoConnection, path) {
  var result = repoConnection.query({
    start: 0,
    count: 0,
    query: "_path = '" + path + "'"
  });
  return result.total > 0;
};

var createLogsNode = function() {
  var repoConn = nodeLib.connect({
    repoId: REPO_NAME,
    branch: 'master'
  });

  var logsExist = nodeWithPathExists(repoConn, LOGS_PATH);

  if (logsExist) {
    log.info('Node [' + LOGS_PATH + '] exists. Nothing to create.');
    return;
  }

  log.info('Creating node [' + LOGS_PATH + '] ...');
  repoConn.create({
    _name: LOGS_PATH.slice(1),
    _parentPath: '/',
    _permissions: ROOT_PERMISSIONS
  });
};

var doInitialize = function() {
  var result = repoLib.get(REPO_NAME);

  if (result) {
    log.info('Repository [' + REPO_NAME + '] exists. Nothing to create.');
  } else {
    log.info('Repository [' + REPO_NAME + ']  not found');
    createRepo();
  }
  createLogsNode();
};

exports.initialize = function() {
  log.info('Initializing repository...');

  contextLib.run(
    {
      user: {
        login: 'su',
        userStore: 'system'
      },
      principals: ['role:system.admin']
    },
    doInitialize
  );

  log.info('Repository initialized.');
};
