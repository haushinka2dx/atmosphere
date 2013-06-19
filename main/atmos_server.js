load('main/core/atmosphere.js');
load('vertx.js');
load('main/handlers/messages_handler.js');
load('main/handlers/announce_handler.js');
load('main/handlers/private_handler.js');
load('main/handlers/monolog_handler.js');
load('main/handlers/relationship_handler.js');
load('main/handlers/auth_handler.js');
load('main/handlers/user_handler.js');

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
	patternsGET[atmos.constants.pathInfo.pMessagesTimeline] = [atmos.createCallback(messagesHandler.globalTimeline, messagesHandler), true];
	patternsGET[atmos.constants.pathInfo.pMessagesGlobalTimeline] = [atmos.createCallback(messagesHandler.globalTimeline, messagesHandler), true];
	patternsGET[atmos.constants.pathInfo.pMessagesFocusedTimeline] = [atmos.createCallback(messagesHandler.focusedTimeline, messagesHandler), true];
	patternsGET[atmos.constants.pathInfo.pMessagesTalkTimeline] = [atmos.createCallback(messagesHandler.talkTimeline, messagesHandler), true];
	patternsGET[atmos.constants.pathInfo.pAnnounceTimeline] = [atmos.createCallback(announceHandler.timeline, announceHandler), true];
	patternsGET[atmos.constants.pathInfo.pPrivateTimeline] = [atmos.createCallback(privateHandler.timeline, privateHandler), true];
	patternsGET[atmos.constants.pathInfo.pMonologTimeline] = [atmos.createCallback(monologHandler.timeline, monologHandler), true];
	patternsGET[atmos.constants.pathInfo.pRelationshipStatus] = [atmos.createCallback(function(req) { req.response.end(); }, null), true];
	patternsGET[atmos.constants.pathInfo.pRelationshipListeners] = [atmos.createCallback(relationHandler.listeners, relationHandler), true];
	patternsGET[atmos.constants.pathInfo.pRelationshipSpeakers] = [atmos.createCallback(relationHandler.speakers, relationHandler), true];
	patternsGET[atmos.constants.pathInfo.pAuthLogout] = [atmos.createCallback(authHandler.logout, authHandler), true];
	patternsGET[atmos.constants.pathInfo.pAuthWhoami] = [atmos.createCallback(authHandler.whoami, authHandler), true];
	patternsGET[atmos.constants.pathInfo.pUserList] = [atmos.createCallback(userHandler.list, userHandler), true];

	// url patterns and handlers for POST method
	var patternsPOST = {};
	patternsPOST[atmos.constants.pathInfo.pMessagesSend] = [atmos.createCallback(messagesHandler.send, messagesHandler), true];
	patternsPOST[atmos.constants.pathInfo.pMessagesCancel] = [atmos.createCallback(function(req) { req.response.end(); }, null), true];
	patternsPOST[atmos.constants.pathInfo.pMessagesDestroy] = [atmos.createCallback(messagesHandler.destroy, messagesHandler), true];
	patternsPOST[atmos.constants.pathInfo.pMessagesResponse] = [atmos.createCallback(messagesHandler.response, messagesHandler), true];
	patternsPOST[atmos.constants.pathInfo.pMessagesRemoveResponse] = [atmos.createCallback(messagesHandler.removeResponse, messagesHandler), true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceSend] = [atmos.createCallback(announceHandler.send, announceHandler), true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceCancel] = [atmos.createCallback(function(req) { req.response.end(); }, null), true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceDestroy] = [atmos.createCallback(announceHandler.destroy, announceHandler), true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceResponse] = [atmos.createCallback(announceHandler.response, announceHandler), true];
	patternsPOST[atmos.constants.pathInfo.pPrivateSend] = [atmos.createCallback(privateHandler.send, privateHandler), true];
	patternsPOST[atmos.constants.pathInfo.pPrivateCancel] = [atmos.createCallback(function(req) { req.response.end(); }, null), true];
	patternsPOST[atmos.constants.pathInfo.pPrivateDestroy] = [atmos.createCallback(privateHandler.destroy, privateHandler), true];
	patternsPOST[atmos.constants.pathInfo.pPrivateResponse] = [atmos.createCallback(privateHandler.response, privateHandler), true];
	patternsPOST[atmos.constants.pathInfo.pMonologSend] = [atmos.createCallback(monologHandler.send, monologHandler), true];
	patternsPOST[atmos.constants.pathInfo.pMonologCancel] = [atmos.createCallback(function(req) { req.response.end(); }, null), true];
	patternsPOST[atmos.constants.pathInfo.pMonologDestroy] = [atmos.createCallback(monologHandler.destroy, monologHandler), true];
	patternsPOST[atmos.constants.pathInfo.pRelationshipListen] = [atmos.createCallback(relationHandler.listen, relationHandler), true];
	patternsPOST[atmos.constants.pathInfo.pReadSet] = [atmos.createCallback(function(req) { req.response.end(); }, null), true];
	patternsPOST[atmos.constants.pathInfo.pAuthLogin] = [atmos.createCallback(authHandler.tryLogin, authHandler), false];
	patternsPOST[atmos.constants.pathInfo.pUserRegister] = [atmos.createCallback(userHandler.regist, userHandler), false];

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
