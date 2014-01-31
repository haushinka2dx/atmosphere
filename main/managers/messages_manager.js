load('main/core/constants.js');
load('main/core/persistor.js');
load('main/event/event_info.js');

var MessagesManager = function() {
};
MessagesManager.prototype = {
	collectionName : 'messages',
	persistor : getPersistor(),

	cnMessageId : getPersistor().pk,
	cnMessageType : 'message_type',
	cnMessage : 'message',
	cnAddresses : 'addresses',
	cnAddressesUsers : 'users',
	cnAddressesGroups : 'groups',
	cnHashtags : 'hashtags',
	cnReplyTo : 'reply_to',
	cnCreatedBy : 'created_by',
	cnCreatedAt : 'created_at',
	cnResponces : 'responses',

	messageTypeMessage : 'message',
	messageTypeAnnounce : 'announce',
	messageTypeAnnouncePlus : 'announce_plus',
	messageTypeMonolog : 'monolog',

	maxMessagesCountPerRequest : 200,

	getMessages : function(callbackInfo, currentUserId, messagesTypes, condition, additionalConditionJSON, futureThan, pastThan, count) {
		var mustConditionCallback = atmos.createCallback(
			function(mustCondition) {
				var conditionWithMustInners = [];
				if (atmos.can(mustCondition) && Object.keys(mustCondition).length > 0) {
					conditionWithMustInners.push(mustCondition);
				}
				if (atmos.can(condition) && Object.keys(condition).length > 0) {
					conditionWithMustInners.push(condition);
				}
				var conditionWithMust = {};
				if (conditionWithMustInners.length > 0) {
					conditionWithMust["$and"] = conditionWithMustInners;
				}
			
				MessagesManager.prototype.getMessagesDirectly(
					callbackInfo,
					messagesTypes,
					conditionWithMust,
					additionalConditionJSON,
					futureThan,
					pastThan,
					count
				);
			},
			this
		);

		MessagesManager.prototype.createMustCondition(
			mustConditionCallback,
			currentUserId
		);
	},

	getMessagesDirectly : function(callbackInfo, messagesTypes, condition, additionalConditionJSON, futureThan, pastThan, count) {
		var whereInner = [];
		if (atmos.can(messagesTypes) && messagesTypes.length > 0) {
			var messageTypesCondition = this.persistor.createInCondition(
				MessagesManager.prototype.cnMessageType,
				messagesTypes
			);
			whereInner.push(messageTypesCondition);
		}
		if (atmos.can(condition)) {
			whereInner.push(condition);
		}
		if (atmos.can(additionalConditionJSON)) {
			whereInner.push(additionalConditionJSON);
		}
		var where = {};
		where['$and'] = whereInner;
	
		var createdAtRange = new RangeCondition(MessagesManager.prototype.persistor.createdAt);
		if (atmos.can(futureThan) && futureThan.length > 0) {
			createdAtRange.greaterThan = atmos.parseUTC(futureThan);
		}
		if (atmos.can(pastThan) && pastThan.length > 0) {
			createdAtRange.lessThan = atmos.parseUTC(pastThan);
		}
	
		var limit = MessagesManager.prototype.maxMessagesCountPerRequest;
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

	createMustCondition : function(callbackInfo, currentUserId) {
		if (atmos.can(currentUserId)) {
			var groupCallback = atmos.createCallback(
				function(groupIds) {
					// 自分が発信したものの場合
					// 　→ 制限なし
					var fromMyself = {};
					fromMyself[MessagesManager.prototype.cnCreatedBy] = currentUserId;
					// 他人が発信したものの場合
					// 　→ atmos.pushlishDelaySeconds の時間が経過したもののみを取得する
					var fromOtherCondition = MessagesManager.prototype.persistor.createNotEqualCondition(MessagesManager.prototype.cnCreatedBy, currentUserId);
					var fromOtherDelayRangeCondition = new RangeCondition(MessagesManager.prototype.cnCreatedAt);
					fromOtherDelayRangeCondition.lessThan = atmos.referenceDateTime();
					var fromOtherDelayCondition = {};
					fromOtherDelayCondition[MessagesManager.prototype.cnCreatedAt] = fromOtherDelayRangeCondition.toJSON();
					var fromOtherMustConditions = [
						fromOtherCondition,
						fromOtherDelayCondition
					];
					var fromOtherBaseCondition = {"$and" : fromOtherMustConditions};
					// messageの場合
					// 　→制限なし
					var messageMustCondition = MessagesManager.prototype.persistor.createEqualCondition(MessagesManager.prototype.cnMessageType, MessagesManager.prototype.messageTypeMessage);
					// announceの場合
					// 　→ 自分が所属しているグループが宛先になっているもののみ
					var messageTypeAnnounceCondition = MessagesManager.prototype.persistor.createEqualCondition(MessagesManager.prototype.cnMessageType, MessagesManager.prototype.messageTypeAnnounce);
					var includingMyGroupsCondition = MessagesManager.prototype.persistor.createInCondition(MessagesManager.prototype.cnAddresses + "." + MessagesManager.prototype.cnAddressesGroups, groupIds);
					var announceConditions = [
						messageTypeAnnounceCondition,
						includingMyGroupsCondition
					];
					var announceMustCondition = {"$and" : announceConditions};
					// announce_plus の場合
					// 　→ 自分が所属しているグループが宛先になっているもののみ
					// 　　OR 自分が宛先に含まれているもののみ
					var messageTypeAnnouncePlusCondition = MessagesManager.prototype.persistor.createEqualCondition(MessagesManager.prototype.cnMessageType, MessagesManager.prototype.messageTypeAnnouncePlus);
					var includingMyselfCondition = MessagesManager.prototype.persistor.createInCondition(MessagesManager.prototype.cnAddresses + "." + MessagesManager.prototype.cnAddressesUsers, [ currentUserId ]);
					var includingConditions = [ includingMyGroupsCondition, includingMyselfCondition ];
					var includingCondition = { "$or" : includingConditions };
					var announcePlusConditions = [
						messageTypeAnnouncePlusCondition,
						includingCondition
					];
					var announcePlusMustCondition = {"$and" : announcePlusConditions};
	
					var fromOtherMessageTypesCondition = {"$or" : [messageMustCondition, announceMustCondition, announcePlusMustCondition]};
					var fromOtherMustCondition = {"$and": [fromOtherBaseCondition, fromOtherMessageTypesCondition]};
					// monolog の場合
					// 　→ 自分が発信したもののみに含まれるので明示的な条件は不要
	
					var mustConditions = [ fromMyself, fromOtherMustCondition];
					var mustCondition = { "$or" : mustConditions };
					if (atmos.can(callbackInfo)) {
						callbackInfo.fire(mustCondition);
					}
				},
				this
			);
	
			atmos.user.getGroups(
				groupCallback,
				currentUserId
			);
		}
		else {
			var messageTypeCondition = MessagesManager.prototype.persistor.createEqualCondition(MessagesManager.prototype.cnMessageType, MessagesManager.prototype.messageTypeMessage);
			var delayRangeCondition = new RangeCondition(MessagesManager.prototype.cnCreatedAt);
			delayRangeCondition.lessThan = atmos.referenceDateTime();
			var delayCondition = {};
			delayCondition[MessagesManager.prototype.cnCreatedAt] = delayRangeCondition.toJSON();
			var mustConditions = [
				messageTypeCondition,
				delayCondition
			];
			var mustCondition = {"$and" : mustConditions};
			if (atmos.can(callbackInfo)) {
				callbackInfo.fire(mustCondition);
			}
		}
	},

	send : function(callbackInfo, message, messageType, toUsers, toGroups, hashtags, replyTo, createdBy) {
		if (atmos.canl(message) && atmos.canl(createdBy)) {
			var dataJSON = {};
			dataJSON[MessagesManager.prototype.cnMessage] = message;
			dataJSON[MessagesManager.prototype.cnMessageType] = messageType;
			var addresses = {};
			addresses[MessagesManager.prototype.cnAddressesUsers] = toUsers;
			addresses[MessagesManager.prototype.cnAddressesGroups] = toGroups;
			dataJSON[MessagesManager.prototype.cnAddresses] = addresses;
			dataJSON[MessagesManager.prototype.cnHashtags] = hashtags;
			dataJSON[MessagesManager.prototype.cnReplyTo] = replyTo;
			dataJSON[MessagesManager.prototype.cnCreatedBy] = createdBy;

			var blankResponseInfo = MessagesManager.prototype.createBlankResponseInfo();
			dataJSON[MessagesManager.prototype.cnResponces] = blankResponseInfo;

			MessagesManager.prototype.persistor.insert(
				function(replyJSON) {
					if (atmos.can(callbackInfo)) {
						callbackInfo.fire(replyJSON);
					}

					var createEventInfoCallback = atmos.createCallback(
						function(eventInfo) {
							atmos.notice.notify(eventInfo);
						},
						this
					);
					dataJSON['_id'] = replyJSON['_id'];
					MessagesManager.prototype.createSentMessageEventInfo(
						createEventInfoCallback,
						dataJSON
					);
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

	createNotifyEventInfo : function(callbackInfo, action, targetMsg, includeFromUser, alternativeFromUserId) {
		// message : all
		// announce : addresses(group members)
		// announcePlus : addresses(group members and users)
		// monolog : user only
		
		var fromUserId = atmos.can(alternativeFromUserId) ? alternativeFromUserId : targetMsg[MessagesManager.prototype.cnCreatedBy];
		switch (targetMsg[MessagesManager.prototype.cnMessageType]) {
			case MessagesManager.prototype.messageTypeMessage:
				var eventInfo = new EventInfo(action, targetMsg, fromUserId, []);
				callbackInfo.fire(eventInfo);
				break;
			case MessagesManager.prototype.messageTypeAnnounce:
				var destUserIds = [];
				if (includeFromUser) {
					destUserIds.push(targetMsg[MessagesManager.prototype.cnCreatedBy]);
				}
				var addressesGroupIds = targetMsg[MessagesManager.prototype.cnAddresses][MessagesManager.prototype.cnAddressesGroups];
				var getGroupMembersCallback = atmos.createCallback(
					function(groupMembersResult) {
						if (groupMembersResult['count'] > 0) {
							groupMembersResult['results'].forEach(function(groupMember, index, array) {
								destUserIds.push(groupMember['user_id']);
							});
						}
	
						// remove duplicated users
						destUserIds = atmos.uniqueArray(destUserIds);
	
						var eventInfo = new EventInfo(action, targetMsg, fromUserId, destUserIds);
						callbackInfo.fire(eventInfo);
					},
					this
				);
				atmos.user.getGroupMembers(
					getGroupMembersCallback, 
					addressesGroupIds
				);
				break;
			case MessagesManager.prototype.messageTypeAnnouncePlus:
				var destUserIds = [];
				if (includeFromUser) {
					destUserIds.push(targetMsg[MessagesManager.prototype.cnCreatedBy]);
				}
				var addressesUserIds = targetMsg[MessagesManager.prototype.cnAddresses][MessagesManager.prototype.cnAddressesUsers];
				destUserIds = destUserIds.concat(addressesUserIds);
				var addressesGroupIds = targetMsg[MessagesManager.prototype.cnAddresses][MessagesManager.prototype.cnAddressesGroups];
				var getGroupMembersCallback = atmos.createCallback(
					function(groupMembersResult) {
						if (groupMembersResult['count'] > 0) {
							groupMembersResult['results'].forEach(function(groupMember, index, array) {
								destUserIds.push(groupMember['user_id']);
							});
						}
		
						// remove duplicated users
						destUserIds = atmos.uniqueArray(destUserIds);
		
						var eventInfo = new EventInfo(action, targetMsg, fromUserId, destUserIds);
						callbackInfo.fire(eventInfo);
					},
					this
				);
				atmos.user.getGroupMembers(
					getGroupMembersCallback, 
					addressesGroupIds
				);
				break;
			case MessagesManager.prototype.messageTypeMonolog:
				var destUserIds = [ targetMsg[MessagesManager.prototype.cnCreatedBy] ];
				if (includeFromUser) {
					destUserIds.push(targetMsg[MessagesManager.prototype.cnCreatedBy]);
				}
				// remove duplicated users
				destUserIds = atmos.uniqueArray(destUserIds);
				var eventInfo = new EventInfo(action, targetMsg, fromUserId, destUserIds);
				callbackInfo.fire(eventInfo);
				break;
			default:
				//no action
				callbackInfo.fire(null);
				break;
		}
	},

	createSentMessageEventInfo : function(callbackInfo, msgSent) {
		MessagesManager.prototype.createNotifyEventInfo(callbackInfo, EventAction.prototype.sendMessage, msgSent, false, null);
	},
	
	createSentResponseEventInfo : function(callbackInfo, targetMsg, responderUserId) {
		MessagesManager.prototype.createNotifyEventInfo(callbackInfo, EventAction.prototype.sendResponse, targetMsg, true, responderUserId);
	},
	
	createRemovedMessageEventInfo : function(callbackInfo, msgRemoved) {
		MessagesManager.prototype.createNotifyEventInfo(callbackInfo, EventAction.prototype.removedMessage, msgRemoved, false, null);
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
											if (replyJSON.status === 'ok') {
												var createEventInfoCallback = atmos.createCallback(
													function(eventInfo) {
														atmos.notice.notify(eventInfo);
													},
													this
												);
												MessagesManager.prototype.createRemovedMessageEventInfo (
													createEventInfoCallback,
													targetMessage
												);
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
						var targetMsg = existRet['results'][0];
						if (targetMsg['created_by'] != respondedBy) {
							var currentRespondedByList = targetMsg[MessagesManager.prototype.cnResponces][responseAction];
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
											if (operation === 'add') {
												var createEventInfoCallback = atmos.createCallback(
													function(eventInfo) {
														eventInfo.info = {
															target_msg_id : targetMessageId,
															action : responseAction,
														};

														atmos.notice.notify(eventInfo);
													},
													this
												);
												MessagesManager.prototype.createSentResponseEventInfo(
													createEventInfoCallback,
													targetMsg,
													respondedBy
												);
											}
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
