var vertx = require('vertx');
load('main/core/constants.js');

var AuthManager = function() {
};
AuthManager.prototype = {
	pa : getConstants().authManagerAddress,

	eb : function() {
		var eb = vertx.eventBus;
		return eb;
	},

	keynameAtmosSessionId : "atmos_session_id",
	keynameUserId : "atmos_user_id",

	/// return true if login succeeded
	login : function(callback, sessionId, userId, password) {
		AuthManager.prototype.eb().send(
			AuthManager.prototype.pa + ".login",
			{
				"username" : userId,
				"password" : password
			},
			function(res) {
				atmos.log('auth-manager: ' + JSON.stringify(res));
				if (res['status'] === 'ok') {
					var atmosSessionId = res['sessionID'];
					var atmosUserId = userId;
					var authorizedInfo = {};
					authorizedInfo[AuthManager.prototype.keynameAtmosSessionId] = atmosSessionId;
					authorizedInfo[AuthManager.prototype.keynameUserId] = atmosUserId;
					// store authorized information to session
					atmos.session.putValues(
						function(res) {
							callback(res);
						},
						sessionId,
						authorizedInfo
					);
				}
				else {
					callback(false);
				}
			}
		);
	},

	logout : function(callback, sessionId) {
		var authorizedInfo = {};
		authorizedInfo[AuthManager.prototype.keynameAtmosSessionId] = null;
		authorizedInfo[AuthManager.prototype.keynameUserId] = null;
		atmos.session.putValues(
			function(res) {
				callback();
			},
			sessionId,
			authorizedInfo
		);
	},

	getCurrentUser : function(callbackInfo, sessionId) {
		var keys = [ AuthManager.prototype.keynameAtmosSessionId, AuthManager.prototype.keynameUserId ];
		atmos.session.getValues(
			function(res) {
				var atmosSessionId = res[AuthManager.prototype.keynameAtmosSessionId];
				var currentUserId = res[AuthManager.prototype.keynameUserId];
				if (typeof (atmosSessionId) != 'undefined' && atmosSessionId != null
					&& typeof (currentUserId) != 'undefined' && currentUserId != null) {

					AuthManager.prototype.eb().send(
						AuthManager.prototype.pa + ".authorise",
						{
							"sessionID" : atmosSessionId,
						},
						function(res) {
							if (res['status'] === 'ok') {
								callbackInfo.fire(currentUserId);
							}
							else {
								callbackInfo.fire(null);
							}
						}
					);

				}
				else {
					callbackInfo.fire(null);
				}
			},
			sessionId,
			keys
		);
	},

	getCurrentUserInfo : function(callbackInfo, sessionId) {
		var keys = [ AuthManager.prototype.keynameAtmosSessionId, AuthManager.prototype.keynameUserId ];
		atmos.session.getValues(
			function(res) {
				var atmosSessionId = res[AuthManager.prototype.keynameAtmosSessionId];
				var currentUserId = res[AuthManager.prototype.keynameUserId];
				if (atmos.can(atmosSessionId) && atmos.can(currentUserId)) {

					AuthManager.prototype.eb().send(
						AuthManager.prototype.pa + ".authorise",
						{
							"sessionID" : atmosSessionId,
						},
						function(res) {
							if (res['status'] === 'ok') {
								var userCallback = atmos.createCallback(
									function(currentUserInfo) {
										if (atmos.can(callbackInfo)) {
											callbackInfo.fire(currentUserInfo);
										}
									},
									this 
								);
								atmos.user.getUser(
									userCallback,
									currentUserId
								);
							}
							else {
								callbackInfo.fire(null);
							}
						}
					);

				}
				else {
					callbackInfo.fire(null);
				}
			},
			sessionId,
			keys
		);
	}
};

function getAuthManager() {
	var a = new AuthManager();
	return a;
}
