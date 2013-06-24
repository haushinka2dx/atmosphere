load('main/core/constants.js');
load('main/core/persistor.js');
load('lib/sjcl.min.js');

var UserManager = function() {
};
UserManager.prototype = {
	collectionName : getConstants().authCollectionName,
	persistor : getPersistor(),

	cnUserId : 'username',
	cnPassword : 'password',
	cnAvator : 'avator',
	cnSystemGroups : 'system_groups',
	cnUserGroups : 'user_groups',
	cnRelation : 'relationship',
	cnRelationTypeListen : 'listen',

	defaultAvator : 'default_avator.png',

	createSalt : function(userId, plainPassword) {
		var p = { iv : getConstants().encryptionIV, salt : getConstants().encryptionSalt };
		var pw = userId;
		var src = 'dummyForSalt';

		//make salt
		var saltResult = sjcl.encrypt(userId, src, p);
		var saltResultJSON = JSON.parse(saltResult);

		return saltResultJSON.ct;
	},

	encryptPassword : function(userId, plainPassword, salt) {
		var aSalt = salt;
		if (!atmos.can(aSalt)) {
			aSalt = UserManager.prototype.createSalt(userId, plainPassword);
		}

		var pw = getConstants().encryptionPassword;
		var p = { iv : getConstants().encryptionIV, salt : aSalt };
		var encryptResult = sjcl.encrypt(pw, plainPassword, p);
		var encryptResultJSON = JSON.parse(encryptResult);

		return encryptResultJSON.ct;
	},

	regist : function(callbackInfo, userId, plainPassword, currentUserId) {
		//check if same userId user already exists.
		var where = {};
		where[UserManager.prototype.cnUserId] = userId;
		UserManager.prototype.persistor.find(
			function(existsResult) {
				if (existsResult[UserManager.prototype.persistor.numOfResult] === 0) {
					var encryptedPassword = UserManager.prototype.encryptPassword(userId, plainPassword);
					var userInfo = {};
					userInfo[UserManager.prototype.cnUserId] = userId;
					userInfo[UserManager.prototype.cnPassword] = encryptedPassword;
					userInfo[UserManager.prototype.cnAvator] = UserManager.prototype.defaultAvator;
					userInfo[UserManager.prototype.cnSystemGroups] = [];
					userInfo[UserManager.prototype.cnUserGroups] = [];
					var relationships = {};
					relationships[UserManager.prototype.cnRelationTypeListen] = [];
					userInfo[UserManager.prototype.cnRelation] = relationships;

					UserManager.prototype.persistor.insert(
						function(res) {
							if (atmos.can(callbackInfo)) {
								callbackInfo.fire(res);
							}
						},
						UserManager.prototype.collectionName,
						userInfo,
						currentUserId
					);
				}
				else {
					if (atmos.can(callbackInfo)) {
						callbackInfo.fire({"status":"error", "message":"Already the user with same userId exists."});
					}
				}
			},
			UserManager.prototype.collectionName,
			where
		);
	},

	addSystemGroup : function(callbackInfo, userId, systemGroupId) {
		UserManager.prototype.changeGroup(callbackInfo, userId, systemGroupId, 'system', 'add');
	},

	removeSystemGroup : function(callbackInfo, userId, systemGroupId) {
		UserManager.prototype.changeGroup(callbackInfo, userId, systemGroupId, 'system', 'remove');
	},

	addUserGroup : function(callbackInfo, userId, userGroupId) {
		UserManager.prototype.changeGroup(callbackInfo, userId, userGroupId, 'user', 'add');
	},

	removeUserGroup : function(callbackInfo, userId, userGroupId) {
		UserManager.prototype.changeGroup(callbackInfo, userId, userGroupId, 'user', 'remove');
	},

	changeGroup : function(callbackInfo, userId, groupId, groupType, operation) {
		var condition = {};
		condition[UserManager.prototype.cnUserId] = userId;

		var groupAddition = {};
		if (groupType === 'system') {
			groupAddition[UserManager.prototype.cnSystemGroups] = groupId;
		}
		else {
			groupAddition[UserManager.prototype.cnUserGroups] = groupId;
		}

		var updateInfo = {};
		if (operation === 'add') {
			updateInfo["$addToSet"] = groupAddition;
		}
		else if (operation === 'remove') {
			updateInfo["$pull"] = speakerAddition;
		}

		UserManager.prototype.persistor.updateByCondition(
			function(res) {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(res);
				}
			},
			UserManager.prototype.collectionName,
			condition,
			updateInfo
		);
	},

	addSpeaker : function(callbackInfo, userId, speakerUserId) {
		UserManager.prototype.changeSpeaker(callbackInfo, userId, speakerUserId, 'add');
	},

	removeSpeaker : function(callbackInfo, userId, speakerUserId) {
		UserManager.prototype.changeSpeaker(callbackInfo, userId, speakerUserId, 'remove');
	},

	changeSpeaker : function(callbackInfo, userId, speakerUserId, operation) {
		var condition = {};
		condition[UserManager.prototype.cnUserId] = userId;

		var speakerAddition = {};
		speakerAddition[UserManager.prototype.cnRelation + "." + UserManager.prototype.cnRelationTypeListen] = speakerUserId;

		var updateInfo = {};
		if (operation === 'add') {
			updateInfo["$addToSet"] = speakerAddition;
		}
		else if (operation === 'remove') {
			updateInfo["$pull"] = speakerAddition;
		}

		UserManager.prototype.persistor.updateByCondition(
			function(res) {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(res);
				}
			},
			UserManager.prototype.collectionName,
			condition,
			updateInfo
		);
	},

	getListeners : function(callbackInfo, userId) {
		var getUsersCallback = atmos.createCallback(
			function(userSearchResult) {
				if (atmos.can(callbackInfo)) {
					if (userSearchResult['status'] === 'ok') {
						var userInfoList = userSearchResult['results'];
						var listeners = new Array();
						for (var i=0; i<userInfoList.length; i++) {
							listeners.push(userInfoList[i]['user_id']);
						}
						callbackInfo.fire(listeners);
					}
					else {
						callbackInfo.fire("some error occured");
					}
				}

			},
			this
		);

		var condIn = UserManager.prototype.persistor.createInCondition(
			UserManager.prototype.cnRelation + "." + UserManager.prototype.cnRelationTypeListen,
			[ userId ]
		);

		UserManager.prototype.getUsers(
			getUsersCallback,
			condIn
		);
	},

	getSpeakers : function(callbackInfo, userId) {
		var getUserCallback = atmos.createCallback(
			function(userInfo) {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(userInfo[UserManager.prototype.cnRelation][UserManager.prototype.cnRelationTypeListen]);
				}
			},
			this
		);

		UserManager.prototype.getUser(
			getUserCallback,
			userId
		);
	},

	getAllGroups : function(callbackInfo, userId) {
		var getUserCallback = atmos.createCallback(
			function(userInfo) {
				if (atmos.can(callbackInfo)) {
					var groupIds = new Array();
					var systemGroupIds = userInfo[UserManager.prototype.cnSystemGroups];
					var userGroupIds = userInfo[UserManager.prototype.cnUserGroups];
					for (var i=0; i < systemGroupIds.length; i++) {
						groupIds.push(systemGroupIds[i]);
					}
					for (var i=0; i < userGroupIds.length; i++) {
						groupIds.push(userGroupIds[i]);
					}

					callbackInfo.fire(groupIds);
				}
			},
			this
		);

		UserManager.prototype.getUser(
			getUserCallback,
			userId
		);
	},

	getSystemGroups : function(callbackInfo, userId) {
		var getUserCallback = atmos.createCallback(
			function(userInfo) {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(userInfo[UserManager.prototype.cnSystemGroups]);
				}
			},
			this
		);

		UserManager.prototype.getUser(
			getUserCallback,
			userId
		);
	},

	getUserGroups : function(callbackInfo, userId) {
		var getUserCallback = atmos.createCallback(
			function(userInfo) {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(userInfo[UserManager.prototype.cnUserGroups]);
				}
			},
			this
		);

		UserManager.prototype.getUser(
			getUserCallback,
			userId
		);
	},

	getUser : function(callbackInfo, userId) {
		var userCallback = atmos.createCallback(
			function(userResult) {
				var resultUserInfo = null;
				if (userResult['count'] > 0) {
					resultUserInfo = userResult['results'][0];
				}
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(resultUserInfo);
				}
			},
			this 
		);
		UserManager.prototype.getUsersByUserId(
			userCallback,
			[ userId ]
		);
	},

	getUsersByUserId : function(callbackInfo, userIds) {
		var whereIn = UserManager.prototype.persistor.createInCondition(UserManager.prototype.cnUserId, userIds);
		UserManager.prototype.persistor.find(
			function(res) {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(UserManager.prototype.createResult(res));
				}
			},
			UserManager.prototype.collectionName,
			whereIn
		);
	},

	getUsers : function(callbackInfo, cond, beforeUserId, afterUserId, limit) {
		var where = {};
		if (atmos.can(cond)) {
			where = cond;
		}
	
		var userIdRange = new RangeCondition(UserManager.prototype.cnUserId);
		if (atmos.can(beforeUserId) && beforeUserId.length > 0) {
			userIdRange.lessThan = beforeUserId;
		}
		if (atmos.can(afterUserId) && afterUserId.length > 0) {
			userIdRange.greaterThan = afterUserId;
		}
	
		var limitCond = -1;
		if (atmos.can(limit) && limit > 0) {
			limitCond = limit;
		}
	
		// default sort new -> old
		var sort = {};
		sort[UserManager.prototype.cnUserId] = 1;
	
		UserManager.prototype.persistor.find(
			function(ret) {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(UserManager.prototype.createResult(ret));
				}
			},
			UserManager.prototype.collectionName,
			where,
			userIdRange,
			sort,
			limit
		);
	},

	createResult : function(ret) {
		if (ret['status'] === 'ok') {
			var res = {};
			res['status'] = 'ok';
			res['count'] = ret['number'];
			res['results'] = [];
			for (var i=0; i<ret['results'].length; i++) {
				res['results'].push(UserManager.prototype.createSafetyUserInfo(ret['results'][i]));
			}
			var headUserId = null;
			var tailUserId = null;
			for (var ii=0; ii<ret['results'].length; ii++) {
				var resUserId = ret['results'][ii][Persistor.prototype.userId];
				if (resUserId) {
					if (tailUserId == null || tailUserId > resUserId) {
						tailUserId = resUserId;
					}
					if (headUserId == null || headUserId < resUserId) {
						headUserId = resUserId;
					}
				}
			}
			res['head_user_id'] = tailUserId != null ? tailUserId : '';
			res['tail_user_id'] = headUserId != null ? headUserId : '';
			return res;
		}
		else {
			return ret;
		}
	},

	createSafetyUserInfo : function(userInfo) {
		atmos.log("UserInfo: " + JSON.stringify(userInfo));
		var safeUserInfo = {
			"user_id" : userInfo[UserManager.prototype.cnUserId],
		};
		safeUserInfo[UserManager.prototype.cnAvator] = userInfo[UserManager.prototype.cnAvator];
		safeUserInfo[UserManager.prototype.cnSystemGroups] = userInfo[UserManager.prototype.cnSystemGroups];
		safeUserInfo[UserManager.prototype.cnUserGroups] = userInfo[UserManager.prototype.cnUserGroups];
		safeUserInfo[UserManager.prototype.cnRelation] = userInfo[UserManager.prototype.cnRelation];
		return safeUserInfo;
	},
};

function getUserManager() {
	var u = new UserManager();
	return u;
}
