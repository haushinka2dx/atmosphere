load('main/handlers/atmos_handler.js');
load('main/core/constants.js');
load('main/core/persistor.js');

function GroupHandler() {
	var collectionName = getConstants().authCollectionName;
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
GroupHandler.prototype = Object.create(AtmosHandler.prototype);
GroupHandler.prototype.constructor = GroupHandler;

GroupHandler.prototype.paramNameGroupId = 'group_id';
GroupHandler.prototype.paramNameUserId = 'user_id';
GroupHandler.prototype.paramNameNewGroupId = 'new_group_id';
GroupHandler.prototype.paramNameNewGroupType = 'new_group_type';
GroupHandler.prototype.paramNameNewGroupName = 'new_group_name';
GroupHandler.prototype.paramNameNewGroupExplanation = 'new_group_explanation';
GroupHandler.prototype.paramNameBeforeGroupId = "before_group_id";
GroupHandler.prototype.paramNameAfterGroupId = "after_group_id";

GroupHandler.prototype.regist = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var newGroupId = bodyJSON[GroupHandler.prototype.paramNameNewGroupId];
					var newGroupType = bodyJSON[GroupHandler.prototype.paramNameNewGroupType];
					var newGroupName = bodyJSON[GroupHandler.prototype.paramNameNewGroupName];
					var newGroupExplanation = bodyJSON[GroupHandler.prototype.paramNameNewGroupExplanation];
					if (atmos.can(newGroupId) && atmos.can(newGroupType)) {
						var registCallback = atmos.createCallback(
							function(registResult) {
								req.sendResponse(JSON.stringify(registResult));
							},
							this
						);
		
						atmos.group.regist(
							registCallback,
							newGroupId,
							newGroupType,
							currentUserId,
							atmos.can(newGroupName) ? newGroupName : '',
							atmos.can(newGroupExplanation) ? newGroupExplanation : ''
						);
					}
					else {
						req.sendResponse("'" + GroupHandler.prototype.paramNameNewGroupId + "' and '" + GroupHandler.prototype.paramNameNewGroupType + "' are must be assigned.", 400);
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

GroupHandler.prototype.list = function(req) {
	var where = {};
	var cond = req.getQueryValue(AtmosHandler.prototype.paramNameSearchCondition);
	if (cond != null) {
		where = JSON.parse(cond);
	}
	var beforeGroupId = req.getQueryValue(GroupHandler.prototype.paramNameBeforeGroupId);
	var afterGroupId = req.getQueryValue(GroupHandler.prototype.paramNameAfterGroupId);
	var count = parseInt(req.getQueryValue(AtmosHandler.prototype.paramNameCount), 10);

	var callbackInfo = atmos.createCallback(
		function(res) {
			req.sendResponse(JSON.stringify(res));
		},
		this
	);

	atmos.group.getGroups(callbackInfo, where, beforeGroupId, afterGroupId, count);
};

GroupHandler.prototype.destroy = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var targetGroupId = bodyJSON[GroupHandler.prototype.paramNameGroupId];
					if (atmos.can(targetGroupId)) {
						var destroyCallback = atmos.createCallback(
							function(destroyResult) {
								req.sendResponse(JSON.stringify(destroyResult));
							},
							this
						);
		
						atmos.group.destroy(
							destroyCallback,
							targetGroupId,
							currentUserId
						);
					}
					else {
						req.sendResponse("'" + GroupHandler.prototype.paramNameGroupId + "' is must be assigned.", 400);
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

GroupHandler.prototype.addMember = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var targetGroupId = bodyJSON[GroupHandler.prototype.paramNameGroupId];
					var targetUserId = bodyJSON[GroupHandler.prototype.paramNameUserId];
					if (atmos.can(targetGroupId) && atmos.can(targetUserId)) {
						var addGroupCallback = atmos.createCallback(
							function(addGroupResult) {
								req.sendResponse(JSON.stringify(addGroupResult));
							},
							this
						);
		
						atmos.user.addGroup(
							addGroupCallback,
							targetUserId,
							targetGroupId,
							currentUserId
						);
					}
					else {
						req.sendResponse("'" + GroupHandler.prototype.paramNameGroupId + "' and '" + GroupHandler.prototype.paramNameUserId + "' are must be assigned.", 400);
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

GroupHandler.prototype.removeMember = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var targetGroupId = bodyJSON[GroupHandler.prototype.paramNameGroupId];
					var targetUserId = bodyJSON[GroupHandler.prototype.paramNameUserId];
					if (atmos.can(targetGroupId) && atmos.can(targetUserId)) {
						var removeGroupCallback = atmos.createCallback(
							function(removeGroupResult) {
								req.sendResponse(JSON.stringify(removeGroupResult));
							},
							this
						);
		
						atmos.user.removeGroup(
							removeGroupCallback,
							targetUserId,
							targetGroupId,
							currentUserId
						);
					}
					else {
						req.sendResponse("'" + GroupHandler.prototype.paramNameGroupId + "' and '" + GroupHandler.prototype.paramNameUserId + "' are must be assigned.", 400);
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

function getGroupHandler() {
	var u = new GroupHandler();
	return u;
}
