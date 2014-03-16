load('main/handlers/atmos_handler.js');

function Private() {
	var collectionName = "private";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Private.prototype = Object.create(AtmosHandler.prototype);
Private.prototype.constructor = Private;

Private.prototype.pnAndOr = 'and_or';
Private.prototype.pnToUsers = 'to_users';
Private.prototype.pnHashtags = 'hashtags';
Private.prototype.pnCreatedBy = 'created_by';
Private.prototype.pnKeywords = 'keywords';
Private.prototype.pnResponses = 'responses';
Private.prototype.pnMessageIds = 'message_ids';
Private.prototype.pnReplyToMessageId = 'reply_to_message_id';

Private.prototype.timeline = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var timelineInternalCallback = atmos.createCallback(
				function(timeline) {
					req.sendResponse(JSON.stringify(timeline));
				},
				this
			);
		
			var futureThan = req.getQueryValue(AtmosHandler.prototype.paramNameFutureThan);
			var pastThan = req.getQueryValue(AtmosHandler.prototype.paramNamePastThan);
			var count = parseInt(req.getQueryValue(AtmosHandler.prototype.paramNameCount), 10);
		
			// default sort new -> old
			var sort = {};
			sort[AtmosHandler.prototype.persistor.createdAt] = -1;
			atmos.privates.getMessages(
				timelineInternalCallback,
				currentUserId,
				null,
				futureThan,
				pastThan,
				count
			);
		},
		this
	);
	req.getCurrentUserId(
		getCurrentUserIdCallback
	);
};

Private.prototype.search = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var futureThan = req.getQueryValue(AtmosHandler.prototype.paramNameFutureThan);
			var pastThan = req.getQueryValue(AtmosHandler.prototype.paramNamePastThan);
			var count = parseInt(req.getQueryValue(AtmosHandler.prototype.paramNameCount), 10);
			var andOr = req.getQueryValue(Private.prototype.pnAndOr);
			atmos.log("andOr: " + andOr);
			var toUsers = atmos.string2array(req.getQueryValue(Private.prototype.pnToUsers));
			atmos.log("toUsers: " + toUsers);
			var hashtags = atmos.string2array(req.getQueryValue(Private.prototype.pnHashtags));
			atmos.log("hashtags: " + hashtags);
			var createdByUsers = atmos.string2array(req.getQueryValue(Private.prototype.pnCreatedBy));
			atmos.log("createdByUsers: " + createdByUsers);
			var keywords = atmos.string2array(req.getQueryValue(Private.prototype.pnKeywords));
			atmos.log("keywords: " + keywords);
			var responses = atmos.string2array(req.getQueryValue(Private.prototype.pnResponses));
			atmos.log("responses: " + responses);
			var messageIds = atmos.string2array(req.getQueryValue(Private.prototype.pnMessageIds));
			atmos.log("messageIds: " + messageIds);
			var replyToMessageId = req.getQueryValue(Private.prototype.pnReplyToMessageId);
			atmos.log("replyToMessageId: " + replyToMessageId);

			var innerConditions = [];
			if (toUsers.length > 0) {
				innerConditions.push(atmos.persistor.createInCondition(atmos.privates.cnToUserId, toUsers));
			}
			if (hashtags.length > 0) {
				innerConditions.push(atmos.persistor.createInCondition(atmos.privates.cnHashtags, hashtags));
			}
			if (createdByUsers.length > 0) {
				innerConditions.push(atmos.persistor.createInCondition(atmos.privates.cnCreatedBy, createdByUsers));
			}
			if (keywords.length > 0) {
				var keywordConditions = [];
				for (var i=0; i<keywords.length; i++) {
					var regexKeyword = { '$regex' : keywords[i] };
					var keywordCond = {};
					keywordCond[atmos.privates.cnMessage] = regexKeyword;
					keywordConditions.push(keywordCond);
				}
				var allKeywordConditions = { '$or' : keywordConditions };
				innerConditions.push(allKeywordConditions);
			}
			if (responses.length > 0) {
				var responseInner = [];
				for (var i=0; i<responses.length; i++) {
					var resCondition = {};
					resCondition[atmos.privates.cnResponces + '.' + responses[i]] = { "$not" : { "$size" : 0 }};
					responseInner.push(resCondition);
				}
				if (responseInner.length > 0) {
					var responseCondition = {};
					responseCondition['$or'] = responseInner;
					innerConditions.push(responseCondition);
				}
			}
			if (messageIds.length > 0) {
				innerConditions.push(atmos.persistor.createInCondition(atmos.privates.cnMessageId, messageIds));
			}
			if (atmos.can(replyToMessageId)) {
				innerConditions.push(atmos.persistor.createEqualCondition(atmos.privates.cnReplyTo, replyToMessageId));
			}

			var joint = andOr == 'or' ? "$or" : "$and";

			var additionalCondition = {};
			if (innerConditions.length > 0) {
				additionalCondition[joint] = innerConditions;
			}
			var timelineInternalCallback = atmos.createCallback(
				function(timeline) {
					req.sendResponse(JSON.stringify(timeline));
				},
				this
			);
			atmos.privates.getMessages(
				timelineInternalCallback,
				currentUserId,
				additionalCondition,
				futureThan,
				pastThan,
				count
			);
		},
		this
	);
	req.getCurrentUserId(
		getCurrentUserIdCallback
	);
};

Private.prototype.send = function(req) {
	var getBodyAsJSONCallback = atmos.createCallback(
		function(bodyJSON) {
			var to = bodyJSON['to_user_id'];
			var msg = bodyJSON['message'];
			var dataJSON = {};
			dataJSON['to_user_id'] = to;
			dataJSON['message'] = msg;
			this.sendInternal(req, dataJSON);
		},
		this
	);
	req.getBodyAsJSON(
		getBodyAsJSONCallback
	);
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var toUserIds = atmos.extractAddressesUsers(bodyJSON['to_user_id']);
					var msg = bodyJSON['message'];
					var replyTo = bodyJSON['reply_to'];
			
					var hashtags = atmos.extractHashtags(msg);

					var sendMessageCallback = atmos.createCallback(
						function(res) {
							req.sendResponse(JSON.stringify(res));
						},
						this
					);
					atmos.privates.send(
						sendMessageCallback,
						msg,
						toUserIds,
						hashtags,
						replyTo,
						currentUserId
					);
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

Private.prototype.destroy = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var id = bodyJSON[AtmosHandler.prototype.persistor.pk];
					if (atmos.can(id)) {
						var destroyCallback = atmos.createCallback(
							function(res) {
								req.sendResponse(JSON.stringify(res));
							},
							this
						);
						atmos.privates.destroy(
							destroyCallback,
							id,
							currentUserId
						);
					} else {
						var res = AtmosHandler.prototype.createResponse(AtmosHandler.prototype.returnCodeArgumentMissingError, 'Destroy requires "_id"');
						req.sendResponse(JSON.stringify(res), 400);
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

Private.prototype.response = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var targetMessageId = bodyJSON['target_id'];
					var responseAction = bodyJSON['action'];
			
					var responseCallback = atmos.createCallback(
						function(res) {
							req.sendResponse(JSON.stringify(res));
						},
						this
					);
					atmos.privates.addResponse(
						responseCallback,
						targetMessageId,
						currentUserId,
						responseAction
					);
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

Private.prototype.removeResponse = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var targetMessageId = bodyJSON['target_id'];
					var responseAction = bodyJSON['action'];
			
					var responseCallback = atmos.createCallback(
						function(res) {
							req.sendResponse(JSON.stringify(res));
						},
						this
					);
					atmos.privates.removeResponse(
						responseCallback,
						targetMessageId,
						currentUserId,
						responseAction
					);
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

function getPrivateHandler() {
	var private = new Private();
	return private;
}
