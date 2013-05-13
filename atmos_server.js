load('atmosphere.js');
load('vertx.js');
load('messages_handler.js');
load('announce_handler.js');
load('private_handler.js');
load('monolog_handler.js');
load('auth_handler.js');
load('request_info.js');

/// main function
function main() {
	var messagesHandler = getMessagesHandler();
	var announceHandler = getAnnounceHandler();
	var privateHandler = getPrivateHandler();
	var monologHandler = getMonologHandler();
	var authHandler = getAuthHandler();

	// url patterns and handlers for GET method
	var patternsGET = {};
	patternsGET[atmos.constants.pathInfo.pMessagesTimeline] = [messagesHandler, messagesHandler.timeline, true];
	patternsGET[atmos.constants.pathInfo.pAnnounceTimeline] = [announceHandler, announceHandler.timeline, true];
	patternsGET[atmos.constants.pathInfo.pPrivateTimeline] = [privateHandler, privateHandler.timeline, true];
	patternsGET[atmos.constants.pathInfo.pMonologTimeline] = [monologHandler, monologHandler.timeline, true];
	patternsGET[atmos.constants.pathInfo.pRelationshipStatus] = [null, function(req) { req.response.end(); }, true];
	patternsGET[atmos.constants.pathInfo.pAuthLogout] = [authHandler, authHandler.logout, true];
	patternsGET[atmos.constants.pathInfo.pAuthWhoami] = [authHandler, authHandler.whoami, true];

	// url patterns and handlers for POST method
	var patternsPOST = {};
	patternsPOST[atmos.constants.pathInfo.pMessagesSay] = [messagesHandler, messagesHandler.say, true];
	patternsPOST[atmos.constants.pathInfo.pMessagesTalk] = [messagesHandler, messagesHandler.talk, true];
	patternsPOST[atmos.constants.pathInfo.pMessagesCancel] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pMessagesDestroy] = [messagesHandler, messagesHandler.destroy, true];
	patternsPOST[atmos.constants.pathInfo.pMessagesResponse] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceSend] = [announceHandler, announceHandler.send, true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceCancel] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceDestroy] = [announceHandler, announceHandler.destroy, true];
	patternsPOST[atmos.constants.pathInfo.pAnnounceResponse] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pPrivateSend] = [privateHandler, privateHandler.send, true];
	patternsPOST[atmos.constants.pathInfo.pPrivateCancel] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pPrivateDestroy] = [privateHandler, privateHandler.destroy, true];
	patternsPOST[atmos.constants.pathInfo.pPrivateResponse] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pMonologSend] = [monologHandler, monologHandler.send, true];
	patternsPOST[atmos.constants.pathInfo.pMonologCancel] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pMonologDestroy] = [monologHandler, monologHandler.destroy, true];
	patternsPOST[atmos.constants.pathInfo.pMonologResponse] = [null, function(req) { req.response.end(); }, true];
	patternsPOST[atmos.constants.pathInfo.pRelationshipListen] = [null, function(req) { req.response.end(); }, true];
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
