load('main/handlers/request_handler.js');
load('main/core/persistor.js');

function AtmosHandler(cName) {
	CommonHandler.apply(this);
	atmos.log("AtmosHandler constructor was called with " + cName);
	this.collectionName = cName;
}
AtmosHandler.prototype = Object.create(CommonHandler.prototype);
AtmosHandler.prototype.constructor = AtmosHandler;

AtmosHandler.prototype.responseCollectionName = 'response';

AtmosHandler.prototype.timelineInternal = function(req) {
	var where = {};
	var cond = req.getQueryValue(AtmosHandler.prototype.paramNameSearchCondition);
	if (cond != null) {
		where = JSON.parse(cond);
	}

	var createdAtRange = new RangeCondition(Persistor.prototype.createdAt);
	var futureThanSrc = req.getQueryValue(AtmosHandler.prototype.paramNameFutureThan);
	if (futureThanSrc != null && futureThanSrc.length > 0) {
		createdAtRange.greaterThan = AtmosHandler.prototype.parseUTC(futureThanSrc);
	}

	var pastThanSrc = req.getQueryValue(AtmosHandler.prototype.paramNamePastThan);
	if (pastThanSrc != null && pastThanSrc.length > 0) {
		createdAtRange.lessThan = AtmosHandler.prototype.parseUTC(pastThanSrc);
	}

	var limit = -1;
	var count = parseInt(req.getQueryValue(AtmosHandler.prototype.paramNameCount), 10);
	atmos.log('count: ' + count);
	if (count != null && count > 0) {
		limit = count;
	}

	// default sort new -> old
	var sort = {};
	sort[AtmosHandler.prototype.persistor.createdAt] = -1;

	AtmosHandler.prototype.persistor.find(function(ret) {
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

			req.sendResponse(JSON.stringify(res));
		}
		else {
			req.sendResponse(JSON.stringify(ret));
		}
	}, this.collectionName, where, createdAtRange, sort, limit);
};

AtmosHandler.prototype.getTimelineInternal = function(callbackInfo, req, additionalConditionJSON) {
	var where = {};
	var cond = req.getQueryValue(AtmosHandler.prototype.paramNameSearchCondition);
	if (cond != null) {
		where = JSON.parse(cond);
	}
	if (typeof(additionalConditionJSON) != 'undefined' && additionalConditionJSON != null) {
		for (var condKey in additionalConditionJSON) {
			where[condKey] = additionalConditionJSON[condKey];
		}
	}

	var createdAtRange = new RangeCondition(Persistor.prototype.createdAt);
	var futureThanSrc = req.getQueryValue(AtmosHandler.prototype.paramNameFutureThan);
	if (futureThanSrc != null && futureThanSrc.length > 0) {
		createdAtRange.greaterThan = AtmosHandler.prototype.parseUTC(futureThanSrc);
	}

	var pastThanSrc = req.getQueryValue(AtmosHandler.prototype.paramNamePastThan);
	if (pastThanSrc != null && pastThanSrc.length > 0) {
		createdAtRange.lessThan = AtmosHandler.prototype.parseUTC(pastThanSrc);
	}

	var limit = -1;
	var count = parseInt(req.getQueryValue(AtmosHandler.prototype.paramNameCount), 10);
	atmos.log('count: ' + count);
	if (count != null && count > 0) {
		limit = count;
	}

	// default sort new -> old
	var sort = {};
	sort[AtmosHandler.prototype.persistor.createdAt] = -1;

	AtmosHandler.prototype.persistor.find(function(ret) {
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
};

AtmosHandler.prototype.appendResponseInfo = function(callbackInfo, timelineElements, timelineCollection) {
	var inCondition = new InCondition('target_id');
	for (var i=0; i<timelineElements.length; i++) {
		var tlElementId = timelineElements[i][AtmosHandler.prototype.persistor.pk];
		inCondition.addValue(tlElementId);
	}
	var responseWhere = {};
	responseWhere['target_collection'] = timelineCollection;
	AtmosHandler.prototype.persistor.findIn(
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
				var responseInfo = AtmosHandler.prototype.createBlankResponseInfo();
				var responses = resMap[tlElement[AtmosHandler.prototype.persistor.pk]];
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
};

AtmosHandler.prototype.sendInternal = function(req, dataJSON) {
	if (Object.keys(dataJSON).length > 0) {
		var sessionId = req.getSessionId();
		var getCurrentUserIdCallback = atmos.createCallback(
			function(currentUserId) {
				AtmosHandler.prototype.persistor.insert(
					function(replyJSON) {
						req.sendResponse(JSON.stringify(replyJSON));
					},
					this.collectionName,
					dataJSON,
					currentUserId
				);
			},
			this
		);
		req.getCurrentUserId(
			getCurrentUserIdCallback
		);
	}
	else {
		req.sendResponse('');
	}
};

AtmosHandler.prototype.destroyInternal = function(req) {
	var getBodyAsJSONCallback = atmos.createCallback(
		function(bodyJSON) {
			var id = bodyJSON[AtmosHandler.prototype.persistor.pk];
			if (id != null) {
				try {
					AtmosHandler.prototype.persistor.remove(function(replyJSON) {
						req.sendResponse(JSON.stringify(replyJSON));
					}, this.collectionName, id);
				} catch (ex) {
					atmos.log(ex);
					var res = AtmosHandler.prototype.createResponse(AtmosHandler.prototype.returnCodeSystemError, ex.message);
					req.sendResponse(JSON.stringify(res), 500);
				}
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
};

AtmosHandler.prototype.responseInternal = function(req) {
	var targetCollection = this.collectionName;
	var getBodyAsJSONCallback = atmos.createCallback(
		function(bodyJSON) {
			var targetId = bodyJSON['target_id'];
			var action = bodyJSON['action'];
			var sessionId = req.getSessionId();
			var getCurrentUserIdCallback = atmos.createCallback(
				function(currentUserId) {
					if (atmos.constants.responseAction.contains(action)) {
						//search target message
						this.persistor.findOne(
							function(existRet) {
								if (existRet['status'] === 'ok' && existRet['number'] === 1) {
									if (existRet['results'][0]['created_by'] != currentUserId) {
										var where = {};
										where['target_id'] = targetId;
										where['action'] = action;
										where['created_by'] = currentUserId;
										Messages.prototype.persistor.find(
											function(dupRet) {
												if (dupRet['status'] === 'ok' && dupRet['number'] === 0) {
													var response = {};
													response['target_collection'] = targetCollection;
													response['target_id'] = targetId;
													response['action'] = action;
													Messages.prototype.persistor.insert(
														function(insRet) {
															req.sendResponse(JSON.stringify(insRet));
														},
														AtmosHandler.prototype.responseCollectionName,
														response,
														currentUserId
													);
												}
												else {
													req.sendResponse("You aleady responded.", 400);
												}
											},
											AtmosHandler.prototype.responseCollectionName,
											where,
											null,
											null,
											1
										);
									}
									else {
										req.sendResponse("You can not respond your own message.", 400);
									}
								}
								else {
									req.sendResponse("There is no message assigned by 'targetId'.", 400);
								}
							},
							targetCollection,
							targetId
						);
					}
					else {
						req.sendResponse("'action' must be " + atmos.constants.responseAction.all() + ".", 400);
					}
				},
				this
			);
			req.getCurrentUserId(
				getCurrentUserIdCallback
			);
		},
		this
	);
	req.getBodyAsJSON(
		getBodyAsJSONCallback
	);
};

AtmosHandler.prototype.createBlankResponseInfo = function() {
	var actions = ResponseAction.prototype.all();
	var info = {};
	for (var i=0; i<actions.length; i++) {
		info[actions[i]] = new Array();
	}
	return info;
};

AtmosHandler.prototype.parseUTC = function(dateString) {
	var pattern = /([1-9][0-9]{3})-([01][0-9])-([0-3][0-9])T([0-2][0-9]):([0-5][0-9]):([0-5][0-9])\.([0-9]{3})Z/;
	var d = pattern.exec(dateString);
	return new Date(Date.UTC(d[1],parseInt(d[2],10)-1,d[3],d[4],d[5],d[6],d[7]));
};

