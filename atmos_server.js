load('atmosphere.js');
load('vertx.js');
load('messages_handler.js');
load('announce_handler.js');
load('private_handler.js');
load('monolog_handler.js');
load('relationship_handler.js');
load('auth_handler.js');
load('user_handler.js');

/// main function
function main() {
	var messagesHandler = getMessagesHandler();
	var announceHandler = getAnnounceHandler();
	var privateHandler = getPrivateHandler();
	var monologHandler = getMonologHandler();
	var relationHandler = getRelationshipHandler();
	var authHandler = getAuthHandler();
	var userHandler = getUserHandler();

	// url patterns and handlers for GET method
	var patternsGET = {};
	patternsGET[atmos.constants.pathInfo.pMessagesTimeline] = [messagesHandler, messagesHandler.globalTimeline, true];
	patternsGET[atmos.constants.pathInfo.pMessagesGlobalTimeline] = [messagesHandler, messagesHandler.globalTimeline, true];
	patternsGET[atmos.constants.pathInfo.pMessagesFocusedTimeline] = [messagesHandler, messagesHandler.focusedTimeline, true];
	patternsGET[atmos.constants.pathInfo.pMessagesTalkTimeline] = [messagesHandler, messagesHandler.talkTimeline, true];
	patternsGET[atmos.constants.pathInfo.pAnnounceTimeline] = [announceHandler, announceHandler.timeline, true];
	patternsGET[atmos.constants.pathInfo.pPrivateTimeline] = [privateHandler, privateHandler.timeline, true];
	patternsGET[atmos.constants.pathInfo.pMonologTimeline] = [monologHandler, monologHandler.timeline, true];
	patternsGET[atmos.constants.pathInfo.pRelationshipStatus] = [null, function(req) { req.response.end(); }, true];
	patternsGET[atmos.constants.pathInfo.pRelationshipListeners] = [relationHandler, relationHandler.listeners, true];
	patternsGET[atmos.constants.pathInfo.pRelationshipSpeakers] = [relationHandler, relationHandler.speakers, true];
	patternsGET[atmos.constants.pathInfo.pAuthLogout] = [authHandler, authHandler.logout, true];
	patternsGET[atmos.constants.pathInfo.pAuthWhoami] = [authHandler, authHandler.whoami, true];
	patternsGET[atmos.constants.pathInfo.pUserList] = [userHandler, userHandler.list, true];

	// url patterns and handlers for POST method
	var patternsPOST = {};
	patternsPOST[atmos.constants.pathInfo.pMessagesSend] = [messagesHandler, messagesHandler.send, true];
	patternsPOST[atmos.constants.pathInfo.pMessagesCancel] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pMessagesDestroy] = [messagesHandler, messagesHandler.destroy, true];
	patternsPOST[atmos.constants.pathInfo.pMessagesResponse] = [messagesHandler, messagesHandler.response, true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceSend] = [announceHandler, announceHandler.send, true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceCancel] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceDestroy] = [announceHandler, announceHandler.destroy, true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceResponse] = [announceHandler, announceHandler.response, true];
	patternsPOST[atmos.constants.pathInfo.pPrivateSend] = [privateHandler, privateHandler.send, true];
	patternsPOST[atmos.constants.pathInfo.pPrivateCancel] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pPrivateDestroy] = [privateHandler, privateHandler.destroy, true];
	patternsPOST[atmos.constants.pathInfo.pPrivateResponse] = [privateHandler, privateHandler.response, true];
	patternsPOST[atmos.constants.pathInfo.pMonologSend] = [monologHandler, monologHandler.send, true];
	patternsPOST[atmos.constants.pathInfo.pMonologCancel] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pMonologDestroy] = [monologHandler, monologHandler.destroy, true];
	patternsPOST[atmos.constants.pathInfo.pRelationshipListen] = [relationHandler, relationHandler.listen, true];
	patternsPOST[atmos.constants.pathInfo.pReadSet] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pAuthLogin] = [authHandler, authHandler.tryLogin, false];

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
