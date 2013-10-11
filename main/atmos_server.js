load('main/core/atmosphere.js');
load('main/handlers/messages_handler.js');
load('main/handlers/private_handler.js');
load('main/handlers/relationship_handler.js');
load('main/handlers/auth_handler.js');
load('main/handlers/user_handler.js');
load('main/handlers/group_handler.js');

/// main function
function main() {
	var vertx = require('vertx');
	var container = require('vertx/container');
	var messagesHandler = getMessagesHandler();
	var privateHandler = getPrivateHandler();
	var relationHandler = getRelationshipHandler();
	var authHandler = getAuthHandler();
	var userHandler = getUserHandler();
	var groupHandler = getGroupHandler();

	var requireAuth = true;
	var notRequireAuth = false;
	var isMultipart = true;
	var normal = false;

	// url patterns and handlers for GET method
	var patternsGET = {};
	patternsGET[atmos.constants.pathInfo.pMessagesTimeline] = [atmos.createCallback(messagesHandler.globalTimeline, messagesHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pMessagesGlobalTimeline] = [atmos.createCallback(messagesHandler.globalTimeline, messagesHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pMessagesFocusedTimeline] = [atmos.createCallback(messagesHandler.focusedTimeline, messagesHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pMessagesTalkTimeline] = [atmos.createCallback(messagesHandler.talkTimeline, messagesHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pMessagesAnnounceTimeline] = [atmos.createCallback(messagesHandler.announceTimeline, messagesHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pMessagesMonologTimeline] = [atmos.createCallback(messagesHandler.monologTimeline, messagesHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pMessagesSearch] = [atmos.createCallback(messagesHandler.search, messagesHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pPrivateTimeline] = [atmos.createCallback(privateHandler.timeline, privateHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pRelationshipStatus] = [atmos.createCallback(function(req) { req.response.end(); }, null), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pRelationshipListeners] = [atmos.createCallback(relationHandler.listeners, relationHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pRelationshipSpeakers] = [atmos.createCallback(relationHandler.speakers, relationHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pAuthLogout] = [atmos.createCallback(authHandler.logout, authHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pAuthWhoami] = [atmos.createCallback(authHandler.whoami, authHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pUserList] = [atmos.createCallback(userHandler.list, userHandler), requireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pUserAvator] = [atmos.createCallback(userHandler.avator, userHandler), notRequireAuth, normal];
	patternsGET[atmos.constants.pathInfo.pGroupList] = [atmos.createCallback(groupHandler.list, groupHandler), requireAuth, normal];

	// url patterns and handlers for POST method
	var patternsPOST = {};
	patternsPOST[atmos.constants.pathInfo.pMessagesSend] = [atmos.createCallback(messagesHandler.send, messagesHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pMessagesCancel] = [atmos.createCallback(function(req) { req.response.end(); }, null), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pMessagesDestroy] = [atmos.createCallback(messagesHandler.destroy, messagesHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pMessagesResponse] = [atmos.createCallback(messagesHandler.response, messagesHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pMessagesRemoveResponse] = [atmos.createCallback(messagesHandler.removeResponse, messagesHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pPrivateSend] = [atmos.createCallback(privateHandler.send, privateHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pPrivateCancel] = [atmos.createCallback(function(req) { req.response.end(); }, null), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pPrivateDestroy] = [atmos.createCallback(privateHandler.destroy, privateHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pPrivateResponse] = [atmos.createCallback(privateHandler.response, privateHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pRelationshipListen] = [atmos.createCallback(relationHandler.listen, relationHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pReadSet] = [atmos.createCallback(function(req) { req.response.end(); }, null), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pAuthLogin] = [atmos.createCallback(authHandler.tryLogin, authHandler), notRequireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pUserRegister] = [atmos.createCallback(userHandler.regist, userHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pUserChangeAvator] = [atmos.createCallback(userHandler.changeAvator, userHandler), requireAuth, isMultipart];
	patternsPOST[atmos.constants.pathInfo.pUserChangePassword] = [atmos.createCallback(userHandler.changePassword, userHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pGroupRegister] = [atmos.createCallback(groupHandler.regist, groupHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pGroupDestroy] = [atmos.createCallback(groupHandler.destroy, groupHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pGroupAddMember] = [atmos.createCallback(groupHandler.addMember, groupHandler), requireAuth, normal];
	patternsPOST[atmos.constants.pathInfo.pGroupRemoveMember] = [atmos.createCallback(groupHandler.removeMember, groupHandler), requireAuth, normal];

	var server = atmos.createHttpServer(patternsGET, patternsPOST);

	var mongoconf = {
		"address": atmos.constants.persistorAddress,
		"host": atmos.constants.persistorHostname,
		"port": atmos.constants.persistorPort,
		"db_name": atmos.constants.persistorDbName
	};

	container.deployModule('io.vertx~mod-mongo-persistor~2.0.0-final', mongoconf, 1, function() {
		atmos.log('Mongo persistor was deployed.');
		// TODO: set initial user

		// register administrator if there is no administrator.
		var adminUserId = getConstants().adminUserId;
		var getUserCallback = atmos.createCallback(
			function (userInfo) {
				if (userInfo == null) {
					var registCallback = atmos.createCallback(
						function(res) {
							atmos.log('Administrator registration result: ' + JSON.stringify(res));
						},
						this
					);
					atmos.user.regist(
						registCallback,
						adminUserId,
						getConstants().adminPassword,
						adminUserId,
						true // as admin
					);
				}
			},
			this
		);
		atmos.user.getUser(
			getUserCallback,
			adminUserId
		);

		// register special groups
		var adminGroupIds = getConstants().adminGroupIds;
		var addGroupFuncs = [];
		for (var i = 0; i < adminGroupIds.length; i++) {
			var adminGroupId = adminGroupIds[i];
			var addGroupFunc = (function() {
				var newGroupId = adminGroupId;
				var newGroupType = atmos.group.groupTypeSystem;
				var newCreatedBy = getConstants().adminUserId;
				var func = function() {
					var getGroupCallback = atmos.createCallback(
						function (groupInfo) {
							if (groupInfo == null) {
								var registCallback = atmos.createCallback(
									function(res) {
										atmos.log('Administrator registration result: ' + JSON.stringify(res));
									},
									this
								);
		
								atmos.group.regist(
									registCallback,
									newGroupId,
									newGroupType,
									newCreatedBy
								);
							}
						},
						this
					);
					atmos.group.getGroup(
						getGroupCallback,
						adminGroupId
					);
				}
				return func;
			})();
			addGroupFuncs.push(addGroupFunc);
		}
		for (var j=0; j<addGroupFuncs.length; j++) {
			addGroupFuncs[j]();
		}
	});

	var sessionManagerConf = {
		"address" : atmos.constants.sessionManagerAddress,
		"timeout" : atmos.constants.sessionTimeoutMilliseconds,
		"cleaner" : atmos.constants.sessionCleanedNotifyAddress,
		"prefix" : atmos.constants.sessionIdPrefix,
	};

	container.deployModule('com.campudus.session-manager-v1.2.1', sessionManagerConf, 1, function() {
		atmos.log('Session Manager was deployed.');
	});

	var authManagerConf = {
		"address" : atmos.constants.authManagerAddress,
		"user_collection" : atmos.constants.authCollectionName,
		"persistor_address" : atmos.constants.persistorAddress,
		"session_timeout" : atmos.constants.authTimeoutMilliseconds,
		"max_connections_per_user" : atmos.constants.maxConnectionsPerUser,
	};
	
	container.deployModule('io.vertx~mod-auth-mgr~2.1.0-SNAPSHOT', authManagerConf, 1, function() {
		atmos.log('Auth Manager was deployed.');
	});

	server.listen(atmos.constants.restAPIListenPort, atmos.constants.restAPIHostname);

	var sockJSServer = atmos.createSockJSServer();
	sockJSServer.listen(atmos.constants.streamingListenPort, atmos.constants.streamingHostname);
}

main();
