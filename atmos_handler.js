load('request_handler.js');
load('persistor.js');

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

AtmosHandler.prototype.sendInternal = function(req, dataJSON) {
	if (Object.keys(dataJSON).length > 0) {
		var sessionId = req.getSessionId();
		req.getCurrentUserId(this, function(currentUserId) {
			AtmosHandler.prototype.persistor.insert(
				function(replyJSON) {
					req.sendResponse(JSON.stringify(replyJSON));
				},
				this.collectionName,
				dataJSON,
				currentUserId
			);
		},
		sessionId);
	}
	else {
		req.sendResponse('');
	}
};

AtmosHandler.prototype.destroyInternal = function(req) {
	req.getBodyAsJSON(this, function(bodyJSON) {
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
	});
};

AtmosHandler.prototype.responseInternal = function(req) {
	var targetCollection = this.collectionName;
	req.getBodyAsJSON(this, function(bodyJSON) {
		var targetId = bodyJSON['target_id'];
		var action = bodyJSON['action'];
		var sessionId = req.getSessionId();
		req.getCurrentUserId(this, function(currentUserId) {
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
		});
	});
};

AtmosHandler.prototype.parseUTC = function(dateString) {
	var pattern = /([1-9][0-9]{3})-([01][0-9])-([0-3][0-9])T([0-2][0-9]):([0-5][0-9]):([0-5][0-9])\.([0-9]{3})Z/;
	var d = pattern.exec(dateString);
	return new Date(Date.UTC(d[1],parseInt(d[2],10)-1,d[3],d[4],d[5],d[6],d[7]));
};

