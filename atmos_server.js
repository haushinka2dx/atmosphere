load('atmosphere.js');
load('vertx.js');
load('messages_handler.js');

/// main function
function main() {
	var messagesHandler = getMessagesHandler();

	// url patterns and handlers for GET method
	var patternsGET = {};
	patternsGET[atmos.constants.pathInfo.pMessagesTimeline] = messagesHandler.timeline;
	patternsGET[atmos.constants.pathInfo.pAnnounceTimeline] = function(req) { req.response.end(); };
	patternsGET[atmos.constants.pathInfo.pPrivateTimeline] = function(req) { req.response.end(); };
	patternsGET[atmos.constants.pathInfo.pMonologTimeline] = function(req) { req.response.end(); };
	patternsGET[atmos.constants.pathInfo.pRelationshipStatus] = function(req) { req.response.end(); };

	// url patterns and handlers for POST method
	var patternsPOST = {};
	patternsPOST[atmos.constants.pathInfo.pMessagesSay] = messagesHandler.say;
	patternsPOST[atmos.constants.pathInfo.pMessagesTalk] = messagesHandler.talk;
	patternsPOST[atmos.constants.pathInfo.pMessagesCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMessagesDestroy] = messagesHandler.destroy;
	patternsPOST[atmos.constants.pathInfo.pMessagesResponse] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pAnnounceSend] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pAnnounceCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pAnnounceDestroy] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pAnnounceResponse] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pPrivateSend] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pPrivateCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pPrivateDestroy] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pPrivateResponse] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMonologSend] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMonologCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMonologDestroy] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMonologResponse] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pRelationshipListen] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pReadSet] = function(req) { req.response.end(); };
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
	patternsPOST[atmos.constants.pathInfo.pAuthLogin] = function(req) { 
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
	};
	patternsPOST[atmos.constants.pathInfo.pAuthLogout] = function(req) {
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
	};

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
	}

	vertx.deployModule('com.campudus.session-manager-v1.2.1', sessionManagerConf, 1, function() {
		atmos.log('Session Manager was deployed.');
	});

	var authManagerConf = {
		"address" : atmos.constants.authManagerAddress,
		"user_collection" : atmos.constants.authCollectionName,
		"persistor_address" : atmos.constants.persistorAddress,
		"session_timeout" : atmos.constants.authTimeoutMilliseconds,
	}

	vertx.deployModule('vertx.auth-mgr-v1.1', authManagerConf, 1, function() {
		atmos.log('Auth Manager was deployed.');
	});

	//var sockjsServer = vertx.createSockJSServer(server);
	server.listen(atmos.constants.listenPort, atmos.constants.hostname);
}

main();
