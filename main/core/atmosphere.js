var vertx = require('vertx');
var container = require('vertx/container');
load('main/util/general.js');
load('main/util/strings.js');
load('main/util/atmos_debug.js');
load('main/core/constants.js');
load('main/core/persistor.js');
load('main/core/callback_info.js');
load('main/net/http/request_dispatcher.js');
//load('main/managers/session_manager.js');
load('main/managers/session_manager_mongo.js');
load('main/managers/auth_manager.js');
load('main/managers/user_manager.js');
load('main/managers/group_manager.js');
load('main/managers/messages_manager.js');
load('main/managers/privates_manager.js');
load('main/managers/attachments_manager.js');
load('main/event/notification_manager.js');

var Atmosphere = function() {
};
Atmosphere.prototype = {
	logger : container.logger,
	log : function(msg) {
		plog(Atmosphere.prototype.logger, msg);
	},
	varDump : function(v) {
		var that = this;
		var j = JSON.stringify(v);
		that.log(j);
	},

	dumpRequest : function(req) {
		dump_request(Atmosphere.prototype.logger, req);
	},

	constants : getConstants(),
	persistor : getPersistor(),
	session : getSessionManager(),
	auth : getAuthManager(),
	user : getUserManager(),
	group : getGroupManager(),
	messages : getMessagesManager(),
	privates : getPrivatesManager(),
	notice : getNotificationManager(),
	attachments : getAttachmentsManager(),

	createCallback : function(callback, callbackTarget) {
		return new CallbackInfo(callback, callbackTarget);
	},

	can : function(v) {
		return atmosGeneral.can(v);
	},

	canl : function(v) {
		return atmosGeneral.canl(v);
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
				req.response.statusCode(404);
				req.response.statusMessage('No such API');
				req.response.end();
			};
		}

		rm.noMatch(notFoundHandler);
		server.requestHandler(rm);

		return server;
	},

	createSockJSServer : function() {
		var server = vertx.createHttpServer();

		var sockJSServer = vertx.createSockJSServer(server);
		var sockJSConfig = { prefix: '/notify' };
		sockJSServer.installApp(sockJSConfig, function(sock) {
			sock.dataHandler(function(buffer) {
				sock.pause();
				atmos.log("received: " + buffer);

				try {
					var msgJSON = JSON.parse(buffer);
					atmos.log('action: ' + msgJSON.action);
					if (msgJSON.action === 'start') {
						if (atmos.can(msgJSON[atmos.constants.headerNameSessionId])) {
							var sessionId = msgJSON[atmos.constants.headerNameSessionId];
							var getCurrentUserCallback = atmos.createCallback(
								function(currentUserId) {
									atmos.log('currentUserId: ' + currentUserId);
									var currentUserJSON = { currentUserId : currentUserId };
									sock.write(new vertx.Buffer(JSON.stringify(currentUserJSON)));

									atmos.notice.addListener(sock, currentUserId);
								},
								this
							);
							atmos.auth.getCurrentUser(
								getCurrentUserCallback,
								sessionId
							);
						}
					}
					else {
						atmos.log('unknown action: ' + msgJSON.action);
					}
				}
				catch (ex) {
					atmos.log(ex);
				}

				sock.resume();
			});
			sock.resume();

			atmos.log("connected");
		});

		return server;
	},

	referenceDateTime : function() {
		var current = Date.now();
		return new Date(current - (Atmosphere.prototype.constants.publishDelaySeconds * 1000));
	},

	parseUTC : function(dateString) {
		var pattern = /([1-9][0-9]{3})-([01][0-9])-([0-3][0-9])T([0-2][0-9]):([0-5][0-9]):([0-5][0-9])\.([0-9]{3})Z/;
		var d = pattern.exec(dateString);
		return new Date(Date.UTC(d[1],parseInt(d[2],10)-1,d[3],d[4],d[5],d[6],d[7]));
	},

	uniqueArray : function(srcArray) {
		var uArray = [];
		if (Atmosphere.prototype.can(srcArray)) {
			srcArray.forEach(function(e, i, a) {
				if (uArray.indexOf(e) === -1) {
					uArray.push(e);
				}
			});
		}
		return uArray;
	},

	string2array : function(src, sep) {
		if (Atmosphere.prototype.can(sep)) {
			return atmosStrings.string2array(src, sep);
		}
		else {
			return atmosStrings.string2array(src, ',');
		}
	},

	extractAddressesUsers : function(msg) {
		return atmosStrings.extractAddressesUsers(msg);
	},

	extractAddressesGroups : function(msg) {
		return atmosStrings.extractAddressesGroups(msg);
	},

	extractHashtags : function(msg) {
		return atmosStrings.extractHashtags(msg);
	},

	isStringEndsWith : function(src, stringForSearch) {
		return atmosStrings.endsWith(src, stringForSearch);
	},

	getExtension : function(filename) {
		return atmosStrings.getExtension(filename);
	},

	createTemporaryFilePath : function(extension) {
		var basename = atmos.constants.temporaryPath + java.util.UUID.randomUUID();
		if (atmos.can(extension)) {
			if (0 < extension.length) {
				return basename + '.' + extension;
			} else {
				return basename;
			}
		} else {
			return basename + '.tmp'
		}
	},

	createTemporaryFileName : function(extension) {
		var name = java.util.UUID.randomUUID();
		if (atmos.canl(extension)) {
			return name + '.' + extension;
		}
		else {
			return name;
		}
	},
};

var atmos = new Atmosphere();
