load('main/handlers/request_handler.js');

function Auth() {
	CommonHandler.apply(this);
}
Auth.prototype = Object.create(CommonHandler.prototype);
Auth.prototype.constructor = Auth;

Auth.prototype.tryLogin = function(req) {
	var getBodyAsJSONCallback = atmos.createCallback(
		function(bodyJSON) {
			var userId = bodyJSON['user_id'];
			var password = bodyJSON['password'];
			var encryptedPassword = atmos.user.encryptPassword(userId, password);
			atmos.session.start(function(sessionId) {
				req.sessionId = sessionId;
				atmos.log('SessionID: ' + sessionId);
				atmos.auth.login(
					function(res) {
						var response;
						if (res) {
							response = { 'status' : 'login successful', 'session_id' : sessionId };
						}
						else {
							response = { 'status' : 'login failed' };
						}
						req.sendResponse(JSON.stringify(response));
					},
					req.sessionId,
					userId,
					encryptedPassword
				);
			});
		},
		this
	);
	req.getBodyAsJSON(
		getBodyAsJSONCallback
	);
};

Auth.prototype.logout = function(req) {
	var result = { "status" : "ok" };
	var sessionId = req.getSessionId();
	if (sessionId != null) {
		atmos.auth.logout(
			function() {
				req.sendResponse(JSON.stringify(result));
			},
			sessionId
		);
	}
	else {
		req.sendResponse(JSON.stringify(result));
	}
};

Auth.prototype.whoami = function(req) {
	var sessionId = req.getSessionId();
	var callbackInfo = atmos.createCallback(
		function(userInfo) {
			var userJSON = {};
			if (userInfo != null) {
				userJSON['status'] = 'ok';
				userJSON['user_id'] = userInfo.user_id;
			}
			else {
				userJSON['status'] = 'error';
				userJSON['message'] = 'You are not logged in.';
			}
			req.sendResponse(JSON.stringify(userJSON));
		},
		this
	);
	atmos.auth.getCurrentUserInfo(
		callbackInfo,
		sessionId
	);
}

function getAuthHandler() {
	var a = new Auth();
	return a;
}
