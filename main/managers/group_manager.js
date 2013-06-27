load('main/core/constants.js');
load('main/core/persistor.js');

var GroupManager = function() {
};
GroupManager.prototype = {
	collectionName : 'groups',
	persistor : getPersistor(),

	cnGroupId : 'group_id',
	cnGroupName : 'group_name',
	cnGroupType : 'group_type',
	cnGroupExplanation : 'group_explanation',
	cnCreatedBy : 'created_by',
	cnCreatedAt : 'created_at',

	groupTypeSystem : 'system',
	groupTypeUser : 'user',

	adminGroupIds : getConstants().adminGroupIds,

	regist : function(callbackInfo, groupId, groupType, currentUserId, groupName, groupExplanation) {
		var hasPrivilegeCallback = atmos.createCallback(
			function(hasPrivilege) {
				if (groupType !== GroupManager.prototype.groupTypeSystem || hasPrivilege) {
					//check if same userId user already exists.
					var where = {};
					where[GroupManager.prototype.cnGroupId] = groupId;
					GroupManager.prototype.persistor.find(
						function(existsResult) {
							if (existsResult[GroupManager.prototype.persistor.numOfResult] === 0) {
								var groupInfo = {};
								groupInfo[GroupManager.prototype.cnGroupId] = groupId;
								groupInfo[GroupManager.prototype.cnGroupType] = groupType;
								groupInfo[GroupManager.prototype.cnGroupName] = atmos.can(groupName) ? groupName : '';
								groupInfo[GroupManager.prototype.cnGroupExplanation] = atmos.can(groupExplanation) ? groupExplanation : '';
			
								GroupManager.prototype.persistor.insert(
									function(res) {
										if (atmos.can(callbackInfo)) {
											callbackInfo.fire(res);
										}
									},
									GroupManager.prototype.collectionName,
									groupInfo,
									currentUserId
								);
							}
							else {
								if (atmos.can(callbackInfo)) {
									callbackInfo.fire({"status":"error", "message":"Already the group with same group_id exists."});
								}
							}
						},
						GroupManager.prototype.collectionName,
						where
					);
				}
				else {
					if (atmos.can(callbackInfo)) {
						callbackInfo.fire({"status":"error", "message":"You have no privilege to manipulate system group."});
					}
				}
			},
			this
		);

		atmos.user.hasAdministratorPrivilege(
			hasPrivilegeCallback, 
			currentUserId
		);
	},

	getGroup : function(callbackInfo, groupId) {
		var groupCallback = atmos.createCallback(
			function(groupResult) {
				var resultGroupInfo = null;
				if (groupResult['count'] > 0) {
					resultGroupInfo = groupResult['results'][0];
				}
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(resultGroupInfo);
				}
			},
			this 
		);
		GroupManager.prototype.getGroupsByGroupId(
			groupCallback,
			[ groupId ]
		);
	},

	getGroupsByGroupId : function(callbackInfo, groupIds) {
		var whereIn = GroupManager.prototype.persistor.createInCondition(GroupManager.prototype.cnGroupId, groupIds);
		GroupManager.prototype.persistor.find(
			function(res) {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(GroupManager.prototype.createResult(res));
				}
			},
			GroupManager.prototype.collectionName,
			whereIn
		);
	},

	getGroups : function(callbackInfo, cond, beforeGroupId, afterGroupId, limit) {
		var where = {};
		if (atmos.can(cond)) {
			where = cond;
		}
	
		var groupIdRange = new RangeCondition(GroupManager.prototype.cnGroupId);
		if (atmos.can(beforeGroupId) && beforeGroupId.length > 0) {
			groupIdRange.lessThan = beforeGroupId;
		}
		if (atmos.can(afterGroupId) && afterGroupId.length > 0) {
			groupIdRange.greaterThan = afterGroupId;
		}
	
		var limitCond = -1;
		if (atmos.can(limit) && limit > 0) {
			limitCond = limit;
		}
	
		// default sort new -> old
		var sort = {};
		sort[GroupManager.prototype.cnGroupId] = 1;
	
		GroupManager.prototype.persistor.find(
			function(ret) {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(GroupManager.prototype.createResult(ret));
				}
			},
			GroupManager.prototype.collectionName,
			where,
			groupIdRange,
			sort,
			limit
		);
	},

	getGroupMembers : function(callbackInfo, groupId, currentUserId) {
		var getGroupCallback = atmos.createCallback(
			function(groupInfo) {
				var groupType = groupInfo[GroupManager.prototype.cnGroupType];
				var hasPrivilegeCallback = atmos.createCallback(
					function(hasPrivilege) {
						if ((groupType === GroupManager.prototype.groupTypeSystem && hasPrivilege) || (groupType !== GroupManager.prototype.groupTypeSystem && groupInfo[GroupManager.prototype.cnCreatedBy] === currentUserId)) {
							var where = {};
							where[atmos.user.cnGroups] = groupId;
							var memberCallback = atmos.createCallback(
								function(userResult) {
									if (atmos.can(callbackInfo)) {
										callbackInfo.fire(userResult);
									}
								},
								this
							);

							atmos.user.getUsers(
								memberCallback,
								where,
								beforeUserId,
								afterUserId,
								limit
						   );
						}
						else {
							if (atmos.can(callbackInfo)) {
								callbackInfo.fire({"status":"error", "message":"You has no privilege to manipulate the target group, or the target group is not your group."});
							}
						}
					},
					this
				);

				atmos.user.hasAdministratorPrivilege(
					hasPrivilegeCallback,
					currentUserId
				);
			},
			this
		);

		GroupManager.prototype.getGroup(
			getGroupCallback,
			groupId
		);
	},

	destroy : function(callbackInfo, groupId, currentUserId) {
		var getGroupCallback = atmos.createCallback(
			function(groupInfo) {
				var groupType = groupInfo[GroupManager.prototype.cnGroupType];
				var hasPrivilegeCallback = atmos.createCallback(
					function(hasPrivilege) {
						if ((groupType === GroupManager.prototype.groupTypeSystem && hasPrivilege) || (groupType !== GroupManager.prototype.groupTypeSystem && groupInfo[GroupManager.prototype.cnCreatedBy] === currentUserId)) {
							GroupManager.prototype.persistor.remove(
								function(removeResult) {
									if (removeResult['status'] === 'ok') {
										// remove belonging
									}
									if (atmos.can(callbackInfo)) {
										callbackInfo.fire(removeResult);
									}
								},
								GroupManager.prototype.collectionName,
								groupInfo[GroupManager.prototype.persistor.pk]
							);
						}
						else {
							if (atmos.can(callbackInfo)) {
								callbackInfo.fire({"status":"error", "message":"You has no privilege to manipulate the target group, or the target group is not your group."});
							}
						}
					},
					this
				);

				atmos.user.hasAdministratorPrivilege(
					hasPrivilegeCallback,
					currentUserId
				);
			},
			this
		);

		GroupManager.prototype.getGroup(
			getGroupCallback,
			groupId
		);
	},

	createResult : function(ret) {
		if (ret['status'] === 'ok') {
			var res = {};
			res['status'] = 'ok';
			res['count'] = ret['number'];
			res['results'] = [];
			for (var i=0; i<ret['results'].length; i++) {
				res['results'].push(GroupManager.prototype.createSafetyGroupInfo(ret['results'][i]));
			}
			var headGroupId = null;
			var tailGroupId = null;
			for (var ii=0; ii<ret['results'].length; ii++) {
				var resGroupId = ret['results'][ii][Persistor.prototype.groupId];
				if (resGroupId) {
					if (tailGroupId == null || tailGroupId > resGroupId) {
						tailGroupId = resGroupId;
					}
					if (headGroupId == null || headGroupId < resGroupId) {
						headGroupId = resGroupId;
					}
				}
			}
			res['head_group_id'] = tailGroupId != null ? tailGroupId : '';
			res['tail_group_id'] = headGroupId != null ? headGroupId : '';
			return res;
		}
		else {
			return ret;
		}
	},

	createSafetyGroupInfo : function(groupInfo) {
		atmos.log("GroupInfo: " + JSON.stringify(groupInfo));
		var safeGroupInfo = {};
		safeGroupInfo[GroupManager.prototype.persistor.pk] = groupInfo[GroupManager.prototype.persistor.pk];
		safeGroupInfo[GroupManager.prototype.cnGroupId] = groupInfo[GroupManager.prototype.cnGroupId];
		safeGroupInfo[GroupManager.prototype.cnGroupName] = groupInfo[GroupManager.prototype.cnGroupName];
		safeGroupInfo[GroupManager.prototype.cnGroupType] = groupInfo[GroupManager.prototype.cnGroupType];
		safeGroupInfo[GroupManager.prototype.cnGroupExplanation] = groupInfo[GroupManager.prototype.cnGroupExplanation];
		safeGroupInfo[GroupManager.prototype.cnCreatedBy] = groupInfo[GroupManager.prototype.cnCreatedBy];
		safeGroupInfo[GroupManager.prototype.cnCreatedAt] = groupInfo[GroupManager.prototype.cnCreatedAt];
		return safeGroupInfo;
	},
};

function getGroupManager() {
	var u = new GroupManager();
	return u;
}
