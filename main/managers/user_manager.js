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
	cnGroups : 'groups',
	cnRelation : 'relationship',
	cnRelationTypeListen : 'listen',

	defaultAvator : 'images/avator/default_avator.png',

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

	regist : function(callbackInfo, userId, plainPassword, currentUserId, asAdmin) {
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
					userInfo[UserManager.prototype.cnGroups] = asAdmin ? atmos.group.adminGroupIds : [];
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

	addGroup : function(callbackInfo, userId, groupId, currentUserId) {
		UserManager.prototype.changeGroup(callbackInfo, userId, groupId, currentUserId, 'add');
	},

	removeGroup : function(callbackInfo, userId, groupId, currentUserId) {
		UserManager.prototype.changeGroup(callbackInfo, userId, groupId, currentUserId, 'remove');
	},

	changeGroup : function(callbackInfo, userId, groupId, currentUserId, operation) {
		var groupInfoCallback = atmos.createCallback(
			function(groupInfo) {
				if (atmos.can(groupInfo)) {
					// the user having administrator privilege can manipulate group information if the target group is system group
					var hasPrivilegeCallback = atmos.createCallback(
						function(hasPrivilege) {
							if (groupInfo[atmos.group.cnGroupType] !== atmos.group.groupTypeSystem || hasPrivilege) {
								var condition = {};
								condition[UserManager.prototype.cnUserId] = userId;
						
								var groupAddition = {};
								groupAddition[UserManager.prototype.cnGroups] = groupId;
						
								var updateInfo = {};
								if (operation === 'add') {
									updateInfo["$addToSet"] = groupAddition;
								}
								else if (operation === 'remove') {
									updateInfo["$pull"] = groupAddition;
								}
						
								UserManager.prototype.persistor.updateByCondition(
									function(res) {
										if (atmos.can(callbackInfo)) {
											callbackInfo.fire(res);
										}
										if (res['status'] === 'ok') {
											if (operation === 'add') {
												var eventAction = EventAction.prototype.addGroupMember;
											}
											else {
												var eventAction = EventAction.prototype.removeGroupMember;
											}

											// 追加または削除対象となった人は必ず追加
											var targetUserIds = [ userId ];
											// ユーザーグループの場合はグループオーナーを必ず追加
											if (groupInfo[atmos.group.cnGroupType] === atmos.group.groupTypeUser) {
												targetUserIds.push(groupInfo[atmos.group.cnCreatedBy]);
											}
											// グループメンバーを追加
											var getGroupMemberCallback = atmos.createCallback(
												function(memberUserResult) {
													if (memberUserResult['status'] === 'ok') {
														memberUserResult['results'].forEach(function(memberInfo, index, array) {
															targetUserIds.push(memberInfo['user_id']);
														});
													}
													targetUserIds = atmos.uniqueArray(targetUserIds);
													var notifyInfo = {};
													notifyInfo['group_id'] = groupId;
													notifyInfo['target_user_id'] = userId;
													var eventInfo = new EventInfo(eventAction, notifyInfo, currentUserId, targetUserIds);
													atmos.notice.notify(eventInfo);
												},
												this
											);
											UserManager.prototype.getGroupMembers(
												getGroupMemberCallback,
												[ groupId ]
											);
										}
									},
									UserManager.prototype.collectionName,
									condition,
									updateInfo
								);
							}
							else {
								if (atmos.can(callbackInfo)) {
									callbackInfo.fire({"status":"error", "message":"You have no privilege to manipulate the system group."});
								}
							}
						},
						this
					);
					UserManager.prototype.hasAdministratorPrivilege(
						hasPrivilegeCallback,
						currentUserId
					);
				}
				else {
					if (atmos.can(callbackInfo)) {
						callbackInfo.fire({"status":"error", "message":"There is no group which id is '" + groupId + "'."});
					}
				}
			},
			this
		);

		atmos.group.getGroup(
			groupInfoCallback,
			groupId
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

	getGroups : function(callbackInfo, userId) {
		var getUserCallback = atmos.createCallback(
			function(userInfo) {
				if (atmos.can(callbackInfo)) {
					var groupIds = userInfo[UserManager.prototype.cnGroups];
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

	changeAvator : function(callbackInfo, userId, temporaryAvatorFilePath) {
		// move avator file from temporary directory to formally directory
		var filenameParts = temporaryAvatorFilePath.split('/');
		var filename = filenameParts.length > 0 ? filenameParts[filenameParts.length - 1] : temporaryAvatorFilePath;
		var avatorUserDir = atmos.constants.avatorBasePath + userId + '/';
		vertx.fileSystem.mkDir(avatorUserDir, true, function(errMkdir, res) {
			var avatorPath = avatorUserDir + filename;
			vertx.fileSystem.move(temporaryAvatorFilePath, avatorPath, function(errorOccured) {
				if (!errorOccured) {
					// set avator file path to user information
					var condition = {};
					condition[UserManager.prototype.cnUserId] = userId;
	
					var updateInfoInner = {};
					updateInfoInner[UserManager.prototype.cnAvator] = avatorPath;
					var updateInfo = {};
					updateInfo['$set'] = updateInfoInner;
	
					UserManager.prototype.persistor.updateByCondition(
						function(res) {
							if (atmos.can(callbackInfo)) {
								callbackInfo.fire(res);
							}
							// does not notify currently.
						},
						UserManager.prototype.collectionName,
						condition,
						updateInfo
					);
				}
				else {
					callbackInfo.fire({"status":"error"});
				}
			});
		});
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

	getGroupMembers : function(callbackInfo, groupIds) {
		
		var getUsersCallback = atmos.createCallback(
			function(usersResult) {
				callbackInfo.fire(usersResult);
			},
			this
		);
		var groupsIn = UserManager.prototype.persistor.createInCondition(UserManager.prototype.cnGroups, groupIds);
		UserManager.prototype.getUsers(
			getUsersCallback, 
			groupsIn
		);
	},

	hasAdministratorPrivilege : function(callbackInfo, userId) {
		var getUserCallback = atmos.createCallback(
			function(userInfo) {
				if (userInfo == null) {
					if (atmos.can(callbackInfo)) {
						callbackInfo.fire(false);
					}
				}
				else {
					var result = false;
					var adminGroupIds = atmos.group.adminGroupIds;
					var userBelongingGroupIds = userInfo[UserManager.prototype.cnGroups];
					for (var i=0; i<adminGroupIds.length; i++) {
						var testAdminGroupId = adminGroupIds[i];
						for (var j=0; j<userBelongingGroupIds.length; j++) {
							if (testAdminGroupId === userBelongingGroupIds[j]) {
								result = true;
								break;
							}
						}
						if (result === true) {
							break;
						}
					}
					if (atmos.can(callbackInfo)) {
						callbackInfo.fire(result);
					}
				}
			},
			this
		);

		UserManager.prototype.getUser(
			getUserCallback,
			userId
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
		safeUserInfo[UserManager.prototype.cnGroups] = userInfo[UserManager.prototype.cnGroups];
		safeUserInfo[UserManager.prototype.cnRelation] = userInfo[UserManager.prototype.cnRelation];
		return safeUserInfo;
	},
};

function getUserManager() {
	var u = new UserManager();
	return u;
}
