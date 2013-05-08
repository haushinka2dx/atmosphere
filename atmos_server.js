load('atmosphere.js');
load('vertx.js');
load('messages_handler.js');
load('announce_handler.js');
load('private_handler.js');
load('monolog_handler.js');

/// main function
function main() {
	var messagesHandler = getMessagesHandler();
	var announceHandler = getAnnounceHandler();
	var privateHandler = getPrivateHandler();
	var monologHandler = getMonologHandler();

	// url patterns and handlers for GET method
	var patternsGET = {};
	patternsGET[atmos.constants.pathInfo.pMessagesTimeline] = [messagesHandler, messagesHandler.timeline];
	patternsGET[atmos.constants.pathInfo.pAnnounceTimeline] = [announceHandler, announceHandler.timeline];
	patternsGET[atmos.constants.pathInfo.pPrivateTimeline] = [privateHandler, privateHandler.timeline];
	patternsGET[atmos.constants.pathInfo.pMonologTimeline] = [monologHandler, monologHandler.timeline];
	patternsGET[atmos.constants.pathInfo.pRelationshipStatus] = [null, function(req) { req.response.end(); }];

	// url patterns and handlers for POST method
	var patternsPOST = {};
	patternsPOST[atmos.constants.pathInfo.pMessagesSay] = [messagesHandler, messagesHandler.say];
	patternsPOST[atmos.constants.pathInfo.pMessagesTalk] = [messagesHandler, messagesHandler.talk];
	patternsPOST[atmos.constants.pathInfo.pMessagesCancel] = [null, function(req) { req.response.end(); }];
	patternsPOST[atmos.constants.pathInfo.pMessagesDestroy] = [messagesHandler, messagesHandler.destroy];
	patternsPOST[atmos.constants.pathInfo.pMessagesResponse] = [null, function(req) { req.response.end(); }];
	patternsPOST[atmos.constants.pathInfo.pAnnounceSend] = [announceHandler, announceHandler.send];
	patternsPOST[atmos.constants.pathInfo.pAnnounceCancel] = [null, function(req) { req.response.end(); }];
	patternsPOST[atmos.constants.pathInfo.pAnnounceDestroy] = [announceHandler, announceHandler.destroy];
	patternsPOST[atmos.constants.pathInfo.pAnnounceResponse] = [null, function(req) { req.response.end(); }];
	patternsPOST[atmos.constants.pathInfo.pPrivateSend] = [privateHandler, privateHandler.send];
	patternsPOST[atmos.constants.pathInfo.pPrivateCancel] = [null, function(req) { req.response.end(); }];
	patternsPOST[atmos.constants.pathInfo.pPrivateDestroy] = [privateHandler, privateHandler.destroy];
	patternsPOST[atmos.constants.pathInfo.pPrivateResponse] = [null, function(req) { req.response.end(); }];
	patternsPOST[atmos.constants.pathInfo.pMonologSend] = [monologHandler, monologHandler.send];
	patternsPOST[atmos.constants.pathInfo.pMonologCancel] = [null, function(req) { req.response.end(); }];
	patternsPOST[atmos.constants.pathInfo.pMonologDestroy] = [monologHandler, monologHandler.destroy];
	patternsPOST[atmos.constants.pathInfo.pMonologResponse] = [null, function(req) { req.response.end(); }];
	patternsPOST[atmos.constants.pathInfo.pRelationshipListen] = [null, function(req) { req.response.end(); }];
	patternsPOST[atmos.constants.pathInfo.pReadSet] = [null, function(req) { req.response.end(); }];
//	patternsPOST[atmos.constants.pathInfo.pAuthLogin] = function(req) { 
//		req.dataHandler(function(buffer) {
//			atmos.session.start(function(sessionId) {
//				atmos.log('SessionID: ' + sessionId);
//				atmos.session.putValue(function(result) { atmos.log('result: ' + result); }, sessionId, 'testkey', 13);
//				req.response.end(sessionId);
//			});
//		});
//	};
//	patternsPOST[atmos.constants.pathInfo.pAuthLogout] = function(req) {
//		req.dataHandler(function(buffer) {
//			var bodyJSON = JSON.parse(buffer);
//			var sessionId = bodyJSON['session_id'];
//			atmos.log('body: ' + buffer);
//			atmos.log('session_id: ' + sessionId);
//			atmos.session.getValue(
//				function(data) {
//					atmos.log('data from session: ' + data);
//					req.response.end(data);
//				},
//				sessionId,
//				'testkey');
//		});
//	};
	patternsPOST[atmos.constants.pathInfo.pAuthLogin] = [null, function(req) { 
		req.dataHandler(function(buffer) {
			var bodyJSON = JSON.parse(buffer);
			var userId = bodyJSON['user_id'];
			var password = bodyJSON['password'];
			atmos.session.start(function(sessionId) {
				atmos.log('SessionID: ' + sessionId);
				atmos.session.putValue(function(result) { atmos.log('result: ' + result); }, sessionId, 'testkey', 13);
				atmos.auth.login(
					function(res) {
						var response;
						if (res) {
							response = { 'status' : 'login successful', 'session_id' : sessionId };
						}
						else {
							response = { 'status' : 'login failed', 'session_id' : sessionId };
						}
						req.response.end(JSON.stringify(response));
					},
					sessionId,
					userId,
					password
				);
			});
		});
	}];
	patternsPOST[atmos.constants.pathInfo.pAuthLogout] = [null, function(req) {
		req.dataHandler(function(buffer) {
			var bodyJSON = JSON.parse(buffer);
			var sessionId = bodyJSON['session_id'];
			atmos.log('body: ' + buffer);
			atmos.log('session_id: ' + sessionId);
			atmos.auth.getCurrentUser(
				function(userInfo) {
					req.response.end(JSON.stringify(userInfo));
				},
				sessionId
			);
		});
	}];

	var server = atmos.createHttpServer(patternsGET, patternsPOST);

	var mongoconf = {
		"address": atmos.constants.persistorAddress,
		"host": atmos.constants.persistorHostname,
		"port": atmos.constants.persistorPort,
		"db_name": atmos.constants.persistorDbName
	};

	vertx.deployModule('vertx.mongo-persistor-v1.2.1', mongoconf, 1, function() {
		atmos.log('Mongo persistor was deployed.');
	});

	var sessionManagerConf = {
		"address" : atmos.constants.sessionManagerAddress,
		"timeout" : atmos.constants.sessionTimeoutMilliseconds,
		"cleaner" : atmos.constants.sessionCleanedNotifyAddress,
		"prefix" : atmos.constants.sessionIdPrefix,
	};

	vertx.deployModule('com.campudus.session-manager-v1.2.1', sessionManagerConf, 1, function() {
		atmos.log('Session Manager was deployed.');
	});

	var authManagerConf = {
		"address" : atmos.constants.authManagerAddress,
		"user_collection" : atmos.constants.authCollectionName,
		"persistor_address" : atmos.constants.persistorAddress,
		"session_timeout" : atmos.constants.authTimeoutMilliseconds,
	};

	vertx.deployModule('vertx.auth-mgr-v1.1', authManagerConf, 1, function() {
		atmos.log('Auth Manager was deployed.');
	});

	//var sockjsServer = vertx.createSockJSServer(server);
	server.listen(atmos.constants.listenPort, atmos.constants.hostname);
}

main();
