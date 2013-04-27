load('atmosphere.js');
load('vertx.js');
load('request_handler.js');

/// main function
function main() {
	var messagesHandler = getMessagesHandler();

	// url patterns and handlers for GET method
	var patternsGET = {};
	//patternsGET[atmos.constants.pathInfo.pMessagesTimeline] = function(req) { req.response.end(); };
	//patternsGET[atmos.constants.pathInfo.pMessagesTimeline] = getMessages;
	patternsGET[atmos.constants.pathInfo.pMessagesTimeline] = messagesHandler.timeline;
	//patternsGET[atmos.constants.pathInfo.pAnnounceTimeline] = function(req) { req.response.end(); };
	//patternsGET[atmos.constants.pathInfo.pAnnounceTimeline] = insertMessage;
	patternsGET[atmos.constants.pathInfo.pAnnounceTimeline] = messagesHandler.say;
	patternsGET[atmos.constants.pathInfo.pPrivateTimeline] = function(req) { req.response.end(); };
	patternsGET[atmos.constants.pathInfo.pMonologTimeline] = function(req) { req.response.end(); };
	patternsGET[atmos.constants.pathInfo.pRelationshipStatus] = function(req) { req.response.end(); };

	// url patterns and handlers for POST method
	var patternsPOST = {};
	patternsPOST[atmos.constants.pathInfo.pMessagesSay] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMessagesTalk] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMessagesCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pAnnounceSend] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pAnnounceCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pPrivateSend] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pPrivateCancel] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMonologSend] = function(req) { req.response.end(); };
	patternsPOST[atmos.constants.pathInfo.pMonologCancel] = function(req) { req.response.end(); };
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
