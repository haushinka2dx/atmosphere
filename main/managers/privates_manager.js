load('main/core/constants.js');
load('main/core/persistor.js');
load('main/event/event_info.js');

var PrivateManager = function() {
};
PrivateManager.prototype = {
	collectionName : 'private',
	persistor : getPersistor(),

	cnMessageId : getPersistor().pk,
	cnMessage : 'message',
	cnToUserId : 'to_user_id',
	cnHashtags : 'hashtags',
	cnReplyTo : 'reply_to',
	cnCreatedBy : 'created_by',
	cnCreatedAt : 'created_at',
	cnResponces : 'responses',

	maxMessagesCountPerRequest : 200,

	getMessages : function(callbackInfo, currentUserId, additionalConditionJSON, futureThan, pastThan, count) {
		var mustConditionCallback = atmos.createCallback(
			function(mustCondition) {
				var conditionWithMustInners = [];
				if (atmos.can(mustCondition) && Object.keys(mustCondition).length > 0) {
					conditionWithMustInners.push(mustCondition);
				}
				var conditionWithMust = {};
				if (conditionWithMustInners.length > 0) {
					conditionWithMust["$and"] = conditionWithMustInners;
				}

				PrivateManager.prototype.getMessagesDirectly(
					callbackInfo,
					conditionWithMust,
					additionalConditionJSON,
					futureThan,
					pastThan,
					count
				);
			},
			this
		);

		PrivateManager.prototype.createMustCondition(
			mustConditionCallback,
			currentUserId
		);
	},

	getMessagesDirectly : function(callbackInfo, condition, additionalConditionJSON, futureThan, pastThan, count) {
		var whereInner = [];
		if (atmos.can(condition)) {
			whereInner.push(condition);
		}
		if (atmos.can(additionalConditionJSON)) {
			whereInner.push(additionalConditionJSON);
		}
		var where = {};
		where['$and'] = whereInner;
	
		var createdAtRange = new RangeCondition(PrivateManager.prototype.persistor.createdAt);
		if (atmos.can(futureThan) && futureThan.length > 0) {
			createdAtRange.greaterThan = atmos.parseUTC(futureThan);
		}
		if (atmos.can(pastThan) && pastThan.length > 0) {
			createdAtRange.lessThan = atmos.parseUTC(pastThan);
		}
	
		var limit = PrivateManager.prototype.maxMessagesCountPerRequest;
		if (atmos.can(count) && count > 0) {
			limit = count;
		}
	
		// default sort new -> old
		var sort = {};
		sort[PrivateManager.prototype.persistor.createdAt] = -1;
	
		PrivateManager.prototype.persistor.find(function(ret) {
			if (ret['status'] === 'ok') {
				var res = {};
				res['status'] = 'ok';
				res['count'] = ret['number'];
				res['results'] = ret['results'];
				var oldestDate = null;
				var latestDate = null;
				for (var ii=0; ii<ret['results'].length; ii++) {
					if (!atmos.can(ret['results'][ii]['responses'])) {
						ret['results'][ii]['responses'] = PrivateManager.prototype.createBlankResponseInfo();
					}
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
					fromMyself[PrivateManager.prototype.cnCreatedBy] = currentUserId;
					// 他人が発信したものの場合
					// 　→ atmos.pushlishDelaySeconds の時間が経過したもののみを取得する
					var fromOtherCondition = PrivateManager.prototype.persistor.createNotEqualCondition(PrivateManager.prototype.cnCreatedBy, currentUserId);
					var fromOtherDelayRangeCondition = new RangeCondition(PrivateManager.prototype.cnCreatedAt);
					fromOtherDelayRangeCondition.lessThan = atmos.referenceDateTime();
					var fromOtherDelayCondition = {};
					fromOtherDelayCondition[PrivateManager.prototype.cnCreatedAt] = fromOtherDelayRangeCondition.toJSON();
					var fromOtherMustConditions = [
						fromOtherCondition,
						fromOtherDelayCondition
					];
					var fromOtherBaseCondition = {"$and" : fromOtherMustConditions};
					// なおかつ自分が宛先に含まれるもののみ
					var toMyselfCondition = PrivateManager.prototype.persistor.createInCondition(PrivateManager.prototype.cnToUserId, [currentUserId]);
					var fromOtherMustCondition = {"$and": [fromOtherBaseCondition, toMyselfCondition]};

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
			if (atmos.can(callbackInfo)) {
				callbackInfo.fire({"status":"error", "message":"'currentUserId' is must not be null."});
			}
		}
	},

	send : function(callbackInfo, message, toUserIds, hashtags, replyTo, createdBy) {
		if (atmos.canl(message) && atmos.canl(createdBy) && atmos.canl(toUserIds)) {
			var dataJSON = {};
			dataJSON[PrivateManager.prototype.cnMessage] = message;
			dataJSON[PrivateManager.prototype.cnToUserId] = toUserIds;
			dataJSON[PrivateManager.prototype.cnHashtags] = hashtags;
			dataJSON[PrivateManager.prototype.cnReplyTo] = replyTo;
			dataJSON[PrivateManager.prototype.cnCreatedBy] = createdBy;

			var blankResponseInfo = PrivateManager.prototype.createBlankResponseInfo();
			dataJSON[PrivateManager.prototype.cnResponces] = blankResponseInfo;

			PrivateManager.prototype.persistor.insert(
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
					PrivateManager.prototype.createSentMessageEventInfo(
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
		var fromUserId = atmos.can(alternativeFromUserId) ? alternativeFromUserId : targetMsg[PrivateManager.prototype.cnCreatedBy];
		var destUserIds = [];
		if (includeFromUser) {
			destUserIds.push(targetMsg[PrivateManager.prototype.cnCreatedBy]);
		}
		var rawToUserIds = targetMsg[PrivateManager.prototype.cnToUserId];
		if (rawToUserIds.forEach) {
			var toUserIds = targetMsg[PrivateManager.prototype.cnToUserId].forEach(function(toUserId, i, a) {
				destUserIds.push(toUserId);
			});
		}
		else if (rawToUserIds.length > 0) {
			destUserIds.push(rawToUserIds);
		}

		// remove duplicated users
		destUserIds = atmos.uniqueArray(destUserIds);

		var eventInfo = new EventInfo(action, targetMsg, fromUserId, destUserIds);
		callbackInfo.fire(eventInfo);
	},

	createSentMessageEventInfo : function(callbackInfo, msgSent) {
		PrivateManager.prototype.createNotifyEventInfo(callbackInfo, EventAction.prototype.sendPrivate, msgSent, false, null);
	},
	
	createSentResponseEventInfo : function(callbackInfo, targetMsg, responderUserId) {
		PrivateManager.prototype.createNotifyEventInfo(callbackInfo, EventAction.prototype.sendResponsePrivate, targetMsg, true, responderUserId);
	},
	
	createRemovedMessageEventInfo : function(callbackInfo, msgRemoved) {
		PrivateManager.prototype.createNotifyEventInfo(callbackInfo, EventAction.prototype.removedPrivate, msgRemoved, false, null);
	},

	destroy : function(callbackInfo, id, currentUserId) {
		if (atmos.can(id)) {
			//削除対象を取得してログインユーザーのメッセージかどうかをチェックする
			PrivateManager.prototype.persistor.findOne(
				function(destroyTargetResult) {
					if (destroyTargetResult['status'] === 'ok') {
						if (destroyTargetResult['number'] === 1) {
							var targetMessage = destroyTargetResult['results'][0];
							if (targetMessage['created_by'] === currentUserId) {
								try {
									PrivateManager.prototype.persistor.remove(
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
												PrivateManager.prototype.createRemovedMessageEventInfo (
													createEventInfoCallback,
													targetMessage
												);
											}
										},
										PrivateManager.prototype.collectionName,
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
		PrivateManager.prototype.changeResponse(callbackInfo, targetMessageId, respondedBy, responseAction, 'add');
	},

	removeResponse : function(callbackInfo, targetMessageId, respondedBy, responseAction) {
		PrivateManager.prototype.changeResponse(callbackInfo, targetMessageId, respondedBy, responseAction, 'remove');
	},

	changeResponse : function(callbackInfo, targetMessageId, respondedBy, responseAction, operation) {
		if (atmos.constants.responseAction.contains(responseAction)) {
			//search target message
			PrivateManager.prototype.persistor.findOne(
				function(existRet) {
					if (existRet['status'] === 'ok' && existRet['number'] === 1) {
						var targetMsg = existRet['results'][0];
						if (targetMsg['created_by'] != respondedBy) {
							var currentRespondedByList = targetMsg[PrivateManager.prototype.cnResponces][responseAction];
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
								condition[PrivateManager.prototype.persistor.pk] = targetMessageId;
						
								var responseAddition = {};
								responseAddition[PrivateManager.prototype.cnResponces + "." + responseAction] = respondedBy;
						
								var updateInfo = {};
								if (operation === 'add') {
									updateInfo["$addToSet"] = responseAddition;
								}
								else if (operation === 'remove') {
									updateInfo["$pull"] = responseAddition;
								}
						
								PrivateManager.prototype.persistor.updateByCondition(
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
												PrivateManager.prototype.createSentResponseEventInfo(
													createEventInfoCallback,
													targetMsg,
													respondedBy
												);
											}
										}
									},
									PrivateManager.prototype.collectionName,
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
				PrivateManager.prototype.collectionName,
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

function getPrivatesManager() {
	var u = new PrivateManager();
	return u;
}
