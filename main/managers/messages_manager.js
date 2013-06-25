load('main/core/constants.js');
load('main/core/persistor.js');

var MessagesManager = function() {
};
MessagesManager.prototype = {
	collectionName : 'messages',
	persistor : getPersistor(),

	cnMessageType : 'message_type',
	cnMessage : 'message',
	cnAddresses : 'addresses',
	cnAddressesUsers : 'users',
	cnAddressesGroups : 'groups',
	cnReplyTo : 'reply_to',
	cnCreatedBy : 'created_by',
	cnCreatedAt : 'created_at',
	cnResponces : 'responses',

	messageTypeMessage : 'message',
	messageTypeAnnounce : 'announce',
	messageTypeMonolog : 'monolog',

	getMessages : function(callbackInfo, messagesTypes, condition, additionalConditionJSON, futureThan, pastThan, count) {
		var where = {};
		if (atmos.can(messagesTypes) && messagesTypes.length > 0) {
			var messageTypesCondition = this.persistor.createInCondition(
				MessagesManager.prototype.cnMessageType,
				messagesTypes
			);
			where = messageTypesCondition;
		}
		if (atmos.can(condition)) {
			where = condition;
		}
		if (atmos.can(additionalConditionJSON)) {
			for (var condKey in additionalConditionJSON) {
				where[condKey] = additionalConditionJSON[condKey];
			}
		}
	
		var createdAtRange = new RangeCondition(MessagesManager.prototype.createdAt);
		if (atmos.can(futureThan) && futureThan.length > 0) {
			createdAtRange.greaterThan = atmos.parseUTC(futureThan);
		}
		if (atmos.can(pastThan) && pastThan.length > 0) {
			createdAtRange.lessThan = atmos.parseUTC(pastThan);
		}
	
		var limit = -1;
		if (atmos.can(count) && count > 0) {
			limit = count;
		}
	
		// default sort new -> old
		var sort = {};
		sort[MessagesManager.prototype.persistor.createdAt] = -1;
	
		MessagesManager.prototype.persistor.find(function(ret) {
			if (ret['status'] === 'ok') {
				var res = {};
				res['status'] = 'ok';
				res['count'] = ret['number'];
				res['results'] = ret['results'];
				var oldestDate = null;
				var latestDate = null;
				for (var ii=0; ii<ret['results'].length; ii++) {
					var resDate = ret['results'][ii]['created_at'];
					if (resDate) {
						if (oldestDate == null || oldestDate > resDate) {
							oldestDate = resDate;
						}
						if (latestDate == null || latestDate < resDate) {
							latestDate = resDate;
						}
					}
				}
				res['oldest_created_at'] = oldestDate != null ? oldestDate : '';
				res['latest_created_at'] = latestDate != null ? latestDate : '';
	
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(res);
				}
			}
			else {
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(ret);
				}
			}
		}, this.collectionName, where, createdAtRange, sort, limit);
	},

	send : function(callbackInfo, message, messageType, toUsers, toGroups, replyTo, createdBy) {
		if (atmos.can(message) && atmos.can(createdBy)) {
			var dataJSON = {};
			dataJSON[MessagesManager.prototype.cnMessage] = message;
			dataJSON[MessagesManager.prototype.cnMessageType] = messageType;
			var addresses = {};
			addresses[MessagesManager.prototype.cnAddressesUsers] = toUsers;
			addresses[MessagesManager.prototype.cnAddressesGroups] = toGroups;
			dataJSON[MessagesManager.prototype.cnAddresses] = addresses;
			dataJSON[MessagesManager.prototype.cnReplyTo] = replyTo;
			dataJSON[MessagesManager.prototype.cnCreatedBy] = createdBy;

			var blankResponseInfo = MessagesManager.prototype.createBlankResponseInfo();
			dataJSON[MessagesManager.prototype.cnResponces] = blankResponseInfo;

			MessagesManager.prototype.persistor.insert(
				function(replyJSON) {
					if (atmos.can(callbackInfo)) {
						callbackInfo.fire(replyJSON);
					}
				},
				this.collectionName,
				dataJSON,
				createdBy
			);
		}
		else {
			if (atmos.can(callbackInfo)) {
				callbackInfo.fire({"status":"error", "message":"'message' and 'createdBy' are must not be null."});
			}
		}
	},
	
	destroy : function(callbackInfo, id, currentUserId) {
		if (atmos.can(id)) {
			//削除対象を取得してログインユーザーのメッセージかどうかをチェックする
			MessagesManager.prototype.persistor.findOne(
				function(destroyTargetResult) {
					if (destroyTargetResult['status'] === 'ok') {
						if (destroyTargetResult['number'] === 1) {
							var targetMessage = destroyTargetResult['results'][0];
							if (targetMessage['created_by'] === currentUserId) {
								try {
									MessagesManager.prototype.persistor.remove(
										function(replyJSON) {
											if (atmos.can(callbackInfo)) {
												callbackInfo.fire(replyJSON);
											}
										},
										MessagesManager.prototype.collectionName,
//										this.collectionName,
										id
									);
								} catch (ex) {
									atmos.log(ex);
									var res = {"status":"error", "message":ex.message};
									if (atmos.can(callbackInfo)) {
										callbackInfo.fire(res);
									}
								}
							}
							else {
								callbackInfo.fire({"status":"error", "message":"The message to be destroyed was not your message."});
							}
						}
						else {
							callbackInfo.fire({"status":"error", "message":"The message to be destroyed was not found."});
						}
					}
					else {
						callbackInfo.fire({"status":"error", "message":"Some error was occured."});
					}
				},
				this.collectionName,
				id
			);
			
		} else {
			var res = {"status":"error", "message":'Destroy requires "_id"'};
			if (atmos.can(callbackInfo)) {
				callbackInfo.fire(res);
			}
		}
	},
	
	addResponse : function(callbackInfo, targetMessageId, respondedBy, responseAction) {
		MessagesManager.prototype.changeResponse(callbackInfo, targetMessageId, respondedBy, responseAction, 'add');
	},

	removeResponse : function(callbackInfo, targetMessageId, respondedBy, responseAction) {
		MessagesManager.prototype.changeResponse(callbackInfo, targetMessageId, respondedBy, responseAction, 'remove');
	},

	changeResponse : function(callbackInfo, targetMessageId, respondedBy, responseAction, operation) {
		if (atmos.constants.responseAction.contains(responseAction)) {
			//search target message
			MessagesManager.prototype.persistor.findOne(
				function(existRet) {
					if (existRet['status'] === 'ok' && existRet['number'] === 1) {
						if (existRet['results'][0]['created_by'] != respondedBy) {
							var currentRespondedByList = existRet['results'][0][MessagesManager.prototype.cnResponces][responseAction];
							if (operation === 'add' && currentRespondedByList.indexOf(respondedBy) != -1) {
								if (atmos.can(callbackInfo)) {
									callbackInfo.fire({"status":"error","message":"You aleady responded."});
								}
							}
							else if (operation === 'remove' && currentRespondedByList.indexOf(respondedBy) === -1) {
								if (atmos.can(callbackInfo)) {
									callbackInfo.fire({"status":"error","message":"You do not respond this message."});
								}
							}
							else {
								var condition = {};
								condition[MessagesManager.prototype.persistor.pk] = targetMessageId;
						
								var responseAddition = {};
								responseAddition[MessagesManager.prototype.cnResponces + "." + responseAction] = respondedBy;
						
								var updateInfo = {};
								if (operation === 'add') {
									updateInfo["$addToSet"] = responseAddition;
								}
								else if (operation === 'remove') {
									updateInfo["$pull"] = responseAddition;
								}
						
								MessagesManager.prototype.persistor.updateByCondition(
									function(res) {
										if (atmos.can(callbackInfo)) {
											callbackInfo.fire(res);
										}
									},
									MessagesManager.prototype.collectionName,
									condition,
									updateInfo
								);
							}
						}
						else {
							if (atmos.can(callbackInfo)) {
								callbackInfo.fire({"status":"error","message":"You can not respond your own message."});
							}
						}
					}
					else {
						if (atmos.can(callbackInfo)) {
							callbackInfo.fire({"status":"error","message":"There is no message assigned by 'targetId'."});
						}
					}
				},
				MessagesManager.prototype.collectionName,
				targetMessageId
			);
		}
		else {
			if (atmos.can(callbackInfo)) {
				callbackInfo.fire({"status":"error","message":"'action' must be " + atmos.constants.responseAction.all() + "."});
			}
		}
	},
	
	createBlankResponseInfo : function() {
		var actions = ResponseAction.prototype.all();
		var info = {};
		for (var i=0; i<actions.length; i++) {
			info[actions[i]] = new Array();
		}
		return info;
	}
};

function getMessagesManager() {
	var u = new MessagesManager();
	return u;
}
