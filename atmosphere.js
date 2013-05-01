load('vertx.js');
load('atmos_debug.js');
load('constants.js');
load('persistor.js');
load('request_dispatcher.js');

var Atmosphere = function() {
};
Atmosphere.prototype = {
	logger : vertx.logger,
	log : function(msg) {
		plog(Atmosphere.prototype.logger, msg);
	},
	dumpRequest : function(req) {
		dump_request(Atmosphere.prototype.logger, req);
	},

	constants : getConstants(),
	persistor : getPersistor(),

	createHttpServer : function(patternHandlerMapGET, patternHandlerMapPOST, notFoundHandler) {
		var server = vertx.createHttpServer();
		var rm = new vertx.RouteMatcher();
		dispatchRequestHandlers(rm, 'GET', patternHandlerMapGET, Atmosphere.prototype.logger);
		dispatchRequestHandlers(rm, 'POST', patternHandlerMapPOST, Atmosphere.prototype.logger);
		if (typeof (notFoundHandler) == 'undefined' || notFoundHandler == null) {
			notFoundHandler = function(req) {
				Atmosphere.prototype.log('noMatch');
				dump_request(Atmosphere.prototype.logger, req);
				req.response.sendFile('json/common/404.json');
			};
		}

		rm.noMatch(notFoundHandler);
		server.requestHandler(rm);

		return server;
	},
};

var atmos = new Atmosphere();
