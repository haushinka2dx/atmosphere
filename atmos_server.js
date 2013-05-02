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
	patternsGET[atmos.constants.pathInfo.pMessagesTimeline] = messagesHandler.timeline;
	patternsGET[atmos.constants.pathInfo.pAnnounceTimeline] = announceHandler.timeline;
	patternsGET[atmos.constants.pathInfo.pPrivateTimeline] = privateHandler.timeline;
	patternsGET[atmos.constants.pathInfo.pMonologTimeline] = monologHandler.timeline;
	patternsGET[atmos.constants.pathInfo.pRelationshipStatus] = function(req) { req.response.end(); };

	// url patterns and handlers for POST method
	var patternsPOST = {};
	patternsPOST[atmos.constants.pathInfo.pMessagesSay] = messagesHandler.say;
	patternsPOST[atmos.constants.pathInfo.pMessagesTalk] = messagesHandler.talk;
	patternsPOST[atmos.constants.pathInfo.pMessagesCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMessagesDestroy] = messagesHandler.destroy;
	patternsPOST[atmos.constants.pathInfo.pMessagesResponse] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pAnnounceSend] = announceHandler.send;
	patternsPOST[atmos.constants.pathInfo.pAnnounceCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pAnnounceDestroy] = announceHandler.destroy;
	patternsPOST[atmos.constants.pathInfo.pAnnounceResponse] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pPrivateSend] = privateHandler.send;
	patternsPOST[atmos.constants.pathInfo.pPrivateCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pPrivateDestroy] = privateHandler.destroy;
	patternsPOST[atmos.constants.pathInfo.pPrivateResponse] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMonologSend] = monologHandler.send;
	patternsPOST[atmos.constants.pathInfo.pMonologCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMonologDestroy] = monologHandler.destroy;
	patternsPOST[atmos.constants.pathInfo.pMonologResponse] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pRelationshipListen] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pReadSet] = function(req) { req.response.end(); };

	var server = atmos.createHttpServer(patternsGET, patternsPOST);

	var mongoconf = {
		"address": atmos.constants.persistorAddress,
		"host": atmos.constants.persistorHostname,
		"port": atmos.constants.persistorPort,
		"db_name": atmos.constants.persistorDbName
	};

	vertx.deployModule('vertx.mongo-persistor-v1.2.1', mongoconf, 1, function() {
	});

	//var sockjsServer = vertx.createSockJSServer(server);
	server.listen(atmos.constants.listenPort, atmos.constants.hostname);
}

main();
