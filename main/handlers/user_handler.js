load('main/handlers/atmos_handler.js');
load('main/core/constants.js');
load('main/core/persistor.js');

function UserHandler() {
	var collectionName = getConstants().authCollectionName;
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
UserHandler.prototype = Object.create(AtmosHandler.prototype);
UserHandler.prototype.constructor = UserHandler;

UserHandler.prototype.paramNameNewUserId = 'new_user_id';
UserHandler.prototype.paramNameNewUserPassword = 'new_user_password';
UserHandler.prototype.paramNameBeforeUserId = "before_user_id";
UserHandler.prototype.paramNameAfterUserId = "after_user_id";

UserHandler.prototype.regist = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var newUserId = bodyJSON[UserHandler.prototype.paramNameNewUserId];
					var newUserPassword = bodyJSON[UserHandler.prototype.paramNameNewUserPassword];
					if (atmos.can(newUserId) && atmos.can(newUserPassword)) {
						var registCallback = atmos.createCallback(
							function(registResult) {
								req.sendResponse(JSON.stringify(registResult));
							},
							this
						);
		
						atmos.user.regist(
							registCallback,
							newUserId,
							newUserPassword,
							currentUserId
						);
					}
					else {
						req.sendResponse("'" + UserHandler.prototype.paramNameNewUserId + "' and '" + UserHandler.prototype.paramNameNewUserPassword + "' are must be assigned.", 400);
					}
				},
				this
			);
			req.getBodyAsJSON(
				getBodyAsJSONCallback
			);
		},
		this
	);
	req.getCurrentUserId(
		getCurrentUserIdCallback
	);
};

UserHandler.prototype.list = function(req) {
	var where = {};
	var cond = req.getQueryValue(AtmosHandler.prototype.paramNameSearchCondition);
	if (cond != null) {
		where = JSON.parse(cond);
	}
	var beforeUserId = req.getQueryValue(UserHandler.prototype.paramNameBeforeUserId);
	var afterUserId = req.getQueryValue(UserHandler.prototype.paramNameAfterUserId);
	var count = parseInt(req.getQueryValue(AtmosHandler.prototype.paramNameCount), 10);

	var callbackInfo = atmos.createCallback(
		function(res) {
			req.sendResponse(JSON.stringify(res));
		},
		this
	);

	atmos.user.getUsers(callbackInfo, where, beforeUserId, afterUserId, count);
};

UserHandler.prototype.destroy = function(req) {
	this.destroyInternal(req);
};

function getUserHandler() {
	var u = new UserHandler();
	return u;
}
