load('vertx.js');
load('main/util/atmos_debug.js');
load('main/core/constants.js');
load('main/core/persistor.js');
load('main/core/callback_info.js');
load('main/net/http/request_dispatcher.js');
load('main/managers/session_manager.js');
load('main/managers/auth_manager.js');
load('main/managers/user_manager.js');

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
	session : getSessionManager(),
	auth : getAuthManager(),
	user : getUserManager(),

	createCallback : function(callback, callbackTarget) {
		return new CallbackInfo(callback, callbackTarget);
	},

	can : function(v) {
		return typeof(v) != 'undefined' && v != null;
	},

	createHttpServer : function(patternHandlerMapGET, patternHandlerMapPOST, notFoundHandler) {
		var server = vertx.createHttpServer();
		var rm = new vertx.RouteMatcher();
		dispatchRequestHandlers(rm, 'GET', patternHandlerMapGET, Atmosphere.prototype.logger);
		dispatchRequestHandlers(rm, 'POST', patternHandlerMapPOST, Atmosphere.prototype.logger);
		if (typeof (notFoundHandler) == 'undefined' || notFoundHandler == null) {
			notFoundHandler = function(req) {
				Atmosphere.prototype.log('noMatch');
				dump_request(Atmosphere.prototype.logger, req);
				req.response.statusCode = 404;
				req.response.end();
			};
		}

		rm.noMatch(notFoundHandler);
		server.requestHandler(rm);

		return server;
	},
};

var atmos = new Atmosphere();
