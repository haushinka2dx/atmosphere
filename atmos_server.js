load('atmosphere.js');
load('vertx.js');
load('constants.js');
load('atmos_debug.js');
load('request_dispatcher.js');
load('request_handler.js');
load('persistor.js');

/// main function
function main() {
	var logger = vertx.logger;

	var constants = getConstants();

	var server = vertx.createHttpServer();
	var routeMatcher = new vertx.RouteMatcher();
	var pathInfo = getPathInfo();

	plog(logger, pathInfo.pMessagesTimeline);

	var messagesHandler = getMessagesHandler();

	// url patterns and handlers for GET method
	var patternsGET = {};
	//patternsGET[pathInfo.pMessagesTimeline] = function(req) { req.response.end(); };
	//patternsGET[pathInfo.pMessagesTimeline] = getMessages;
	patternsGET[pathInfo.pMessagesTimeline] = messagesHandler.timeline;
	//patternsGET[pathInfo.pAnnounceTimeline] = function(req) { req.response.end(); };
	//patternsGET[pathInfo.pAnnounceTimeline] = insertMessage;
	patternsGET[pathInfo.pAnnounceTimeline] = messagesHandler.say;
	patternsGET[pathInfo.pPrivateTimeline] = function(req) { req.response.end(); };
	patternsGET[pathInfo.pMonologTimeline] = function(req) { req.response.end(); };
	patternsGET[pathInfo.pRelationshipStatus] = function(req) { req.response.end(); };

	// url patterns and handlers for POST method
	var patternsPOST = {};
	patternsPOST[pathInfo.pMessagesSay] = function(req) { req.response.end(); };
	patternsPOST[pathInfo.pMessagesTalk] = function(req) { req.response.end(); };
	patternsPOST[pathInfo.pMessagesCancel] = function(req) { req.response.end(); };
	patternsPOST[pathInfo.pAnnounceSend] = function(req) { req.response.end(); };
	patternsPOST[pathInfo.pAnnounceCancel] = function(req) { req.response.end(); };
	patternsPOST[pathInfo.pPrivateSend] = function(req) { req.response.end(); };
	patternsPOST[pathInfo.pPrivateCancel] = function(req) { req.response.end(); };
	patternsPOST[pathInfo.pMonologSend] = function(req) { req.response.end(); };
	patternsPOST[pathInfo.pMonologCancel] = function(req) { req.response.end(); };
	patternsPOST[pathInfo.pRelationshipListen] = function(req) { req.response.end(); };
	patternsPOST[pathInfo.pReadSet] = function(req) { req.response.end(); };

	dispatchRequestHandlers(routeMatcher, 'GET', patternsGET, logger);
	dispatchRequestHandlers(routeMatcher, 'POST', patternsPOST, logger);
	
	// dispatch handler for not supported url
	routeMatcher.noMatch(function(req) {
		plog(logger, 'noMatch');
		dump_request(logger, req);
		req.response.sendFile('json/common/404.json');
	});
	
	server.requestHandler(routeMatcher);

	var mongoconf = {
		"address": constants.persistorAddress,
		"host": constants.persistorHostname,
		"port": constants.persistorPort,
		"db_name": constants.persistorDbName
	};

	vertx.deployModule('vertx.mongo-persistor-v1.2.1', mongoconf, 1, function() {
//		var eb = vertx.eventBus;
//		
//		var pa = Constants.persistorAddress;
//		//var pa = 'vertx.persistor';
//		
//		logger.info(eb.prototype);
//		logger.info(pa);
//		var collectionname = 'messages';
//
//		var data = {"id":1, "contents":"This is first message."};
//		eb.send(pa, {"action": 'save', "collection": collectionname, "document": data});
//		eb.send(pa, {"action": 'find', "collection": collectionname, "matcher": {}}, function(ret) {
//        	if (ret.status === 'ok') {
//        	  var resDocs = [];
//        	  for (var i = 0; i < ret.results.length; i++) {
//        	    resDocs[i] = JSON.stringify(ret.results[i]);
//				logger.info(resDocs[i]);
//        	  }
//        	} else {
//        	  logger.info('Failed to retrieve ' + collectionname + ': ' + ret.message);
//        	}
//		});
	});

	//var sockjsServer = vertx.createSockJSServer(server);
	server.listen(constants.listenPort, constants.hostname);
}

function insertMessage(req) {
	var logger = vertx.logger;

	var constants = getConstants();

	var eb = vertx.eventBus;
	var collectionname = "messages";
	var data = {"id":100, "contents":"message from " + req.uri};
	eb.send(constants.persistorAddress, {"action": "save", "collection": collectionname, "document": data});
}

main();
