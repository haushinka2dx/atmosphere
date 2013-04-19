load('vertx.js');
load('constants.js');
load('atmos_debug.js');
load('request_dispatcher.js');

/// main function
function main() {
	var logger = vertx.logger;
	var server = vertx.createHttpServer();
	var routeMatcher = new vertx.RouteMatcher();
	var pathInfo = getPathInfo();

	// url patterns and handlers for GET method
	var patternsGET = new Array();
	patternsGET[pathInfo.pMessagesTimeline] = function(req) { req.response.end(); };
	patternsGET[pathInfo.pAnnounceTimeline] = function(req) { req.response.end(); };
	patternsGET[pathInfo.pPrivateTimeline] = function(req) { req.response.end(); };
	patternsGET[pathInfo.pMonologTimeline] = function(req) { req.response.end(); };
	patternsGET[pathInfo.pRelationshipStatus] = function(req) { req.response.end(); };

	// url patterns and handlers for POST method
	var patternsPOST = new Array();
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
	server.listen(9999, 'localhost');
}

main();
