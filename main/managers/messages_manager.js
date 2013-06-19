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
	cnResponseTypeMemo : 'memo',
	cnResponseTypeUsefull : 'usefull',
	cnResponseTypeGood : 'good',
	cnResponseTypeFun : 'fun',

	messageTypeMessage : 'message',
	messageTypeAnnounce : 'announce',

	getTimelineInternal : function(callbackInfo, condition, futureThan, pastThan, count) {
		var where = {};
		if (atmos.can(condition)) {
			where = condition;
		}
	
		var createdAtRange = new RangeCondition(MessagesManager.prototype.cnCreatedAt);
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
			var messages = {};
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
	
				messages = res;
			}
			else {
				messages = ret;
			}
			if (atmos.can(callbackInfo)) {
				callbackInfo.fire(messages);
			}
		}, this.collectionName, where, createdAtRange, sort, limit);
	},

	getMessages : function(callbackInfo, condition, additionalConditionJSON, futureThan, pastThan, count) {
		var where = {};
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

	appendResponseInfo : function(callbackInfo, timelineElements, timelineCollection) {
		var inCondition = new InCondition('target_id');
		for (var i=0; i<timelineElements.length; i++) {
			var tlElementId = timelineElements[i][MessagesManager.prototype.persistor.pk];
			inCondition.addValue(tlElementId);
		}
		var responseWhere = {};
		responseWhere['target_collection'] = timelineCollection;
		MessagesManager.prototype.persistor.findIn(
			function(retIn) {
				atmos.log('in result: ' + JSON.stringify(retIn));
				// convert array to map(key: target_id, value:array of response document)
				var resMap = new Array();
				var responseList = retIn['results'];
				for (var j=0; j<responseList.length; j++) {
					var response = responseList[j];
					var targetId = response['target_id'];
					if (typeof(resMap[targetId]) === 'undefined' || resMap[targetId] == null) {
						resMap[targetId] = new Array();
					}
					resMap[targetId].push(response);
				}
	
				// add response information to each timeline information
				var appendedTimelineElements = new Array();
				for (var ii=0; ii<timelineElements.length; ii++) {
					var tlElement = timelineElements[ii];
					var responseInfo = MessagesManager.prototype.createBlankResponseInfo();
					var responses = resMap[tlElement[MessagesManager.prototype.persistor.pk]];
					if (typeof(responses) != 'undefined' && responses != null) {
						for (var iii=0; iii<responses.length; iii++) {
							responseInfo[responses[iii]['action']].push(responses[iii]);
						}
					}
					tlElement['responses'] = responseInfo;
					appendedTimelineElements.push(tlElement);
				}
				if (atmos.can(callbackInfo)) {
					callbackInfo.fire(appendedTimelineElements);
				}
			},
			'response',
			responseWhere,
			inCondition
		);
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
	
	respond : function(callbackInfo, targetId, action, respondedBy) {
		var targetCollection = this.collectionName;
		if (atmos.constants.responseAction.contains(action)) {
			//search target message
			MessagesManager.persistor.findOne(
				function(existRet) {
					if (existRet['status'] === 'ok' && existRet['number'] === 1) {
						if (existRet['results'][0]['created_by'] != respondedBy) {
							var where = {};
							where['target_id'] = targetId;
							where['action'] = action;
							where['created_by'] = respondedBy;
							MessagesManager.prototype.persistor.find(
								function(dupRet) {
									if (dupRet['status'] === 'ok' && dupRet['number'] === 0) {
										var response = {};
										response['target_collection'] = targetCollection;
										response['target_id'] = targetId;
										response['action'] = action;
										MessagesManager.prototype.persistor.insert(
											function(insRet) {
												if (atmos.can(callbackInfo)) {
													callbackInfo.fire(insRet);
												}
											},
											MessagesManager.prototype.responseCollectionName,
											response,
											respondedBy
										);
									}
									else {
										if (atmos.can(callbackInfo)) {
											callbackInfo.fire({"status":"error","message":"You aleady responded."});
										}
									}
								},
								MessagesManager.prototype.responseCollectionName,
								where,
								null,
								null,
								1
							);
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
				targetCollection,
				targetId
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
