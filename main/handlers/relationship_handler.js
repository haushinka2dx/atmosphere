load('main/handlers/atmos_handler.js');
load('main/core/constants.js');
load('main/core/persistor.js');

function RelationshipHandler() {
	var collectionName = 'relationship';
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
RelationshipHandler.prototype = Object.create(AtmosHandler.prototype);
RelationshipHandler.prototype.constructor = RelationshipHandler;

RelationshipHandler.prototype.columnNameUserId = 'user_id';
RelationshipHandler.prototype.columnNameTargetUserId = 'target_user_id';
RelationshipHandler.prototype.columnNameRelationType = 'relation_type';

RelationshipHandler.prototype.relationTypeListen = 'listen';

RelationshipHandler.prototype.paramNameTargetUserId = "target_user_id";

RelationshipHandler.prototype.listen = function(req) {
	this.createRelationship(req, this.relationTypeListen);
};

RelationshipHandler.prototype.speakers = function(req) {
	req.getCurrentUserId(this, function(currentUserId) {
		var targetUserId = req.getQueryValue(RelationshipHandler.prototype.paramNameTargetUserId);
		if (typeof(targetUserId) === 'undefined' || targetUserId == null) {
			targetUserId = currentUserId;
		}

		this.getTargetUsers(
			this,
			function(res) {
				if (res['status'] === 'ok') {
					req.sendResponse(JSON.stringify(res));
				}
				else {
					req.sendResponse('Some error occured.', 500);
				}
			},
			targetUserId,
			RelationshipHandler.prototype.relationTypeListen
		);
	});
};

RelationshipHandler.prototype.listeners = function(req) {
	req.getCurrentUserId(this, function(currentUserId) {
		var targetUserId = req.getQueryValue(RelationshipHandler.prototype.paramNameTargetUserId);
		if (typeof(targetUserId) === 'undefined' || targetUserId == null) {
			targetUserId = currentUserId;
		}

		this.getBaseUsers(
			this,
			function(res) {
				if (res['status'] === 'ok') {
					req.sendResponse(JSON.stringify(res));
				}
				else {
					req.sendResponse('Some error occured.', 500);
				}
			},
			targetUserId,
			RelationshipHandler.prototype.relationTypeListen
		);
	});
};

RelationshipHandler.prototype.getSpeakers = function(target, callback, targetUserId) {
	this.getRelationship(
		this,
		function(res) {
			callback.call(target, res);
		},
		targetUserId,
		null,
		RelationshipHandler.prototype.relationTypeListen
	);
};

RelationshipHandler.prototype.getListeners = function(target, callback, targetUserId) {
	this.getRelationship(
		this,
		function(res) {
			callback.call(target, res);
		},
		null,
		targetUserId,
		RelationshipHandler.prototype.relationTypeListen
	);
};

RelationshipHandler.prototype.getTargetUsers = function(target, callback, targetUserId, relationType) {
	this.getRelationship(
		this,
		function(res) {
			callback.call(target, res);
		},
		targetUserId,
		null,
		relationType
	);
};

RelationshipHandler.prototype.getBaseUsers = function(target, callback, targetUserId, relationType) {
	this.getRelationship(
		this,
		function(res) {
			callback.call(target, res);
		},
		null,
		targetUserId,
		relationType
	);
};

RelationshipHandler.prototype.createRelationship = function(req, relationType) {
	req.getCurrentUserId(this, function(currentUserId) {
		req.getBodyAsJSON(this, function(bodyJSON) {
			var targetUserId = bodyJSON[RelationshipHandler.prototype.paramNameTargetUserId];
	
			if (typeof(targetUserId) === 'undefined' || targetUserId == null) {
				req.sendResponse("'target_user_id' must be assigned.", 400);
			}

			this.getRelationship(
				this,
				function(res) {
					if (res['status'] === 'ok') {
						if (res['count'] === 0) {
							var document = {};
							document[RelationshipHandler.prototype.columnNameUserId] = currentUserId;
							document[RelationshipHandler.prototype.columnNameTargetUserId] = targetUserId;
							document[RelationshipHandler.prototype.columnNameRelationType] = relationType;

							RelationshipHandler.prototype.persistor.insert(
								function(insertResult) {
									req.sendResponse(JSON.stringify(insertResult));
								},
								this.collectionName,
								document,
								currentUserId
							);

						}
						else {
							req.sendResponse('You already have ' + relationType + ' relationship with ' + targetUserId + '.', 400);
						}
					}
					else {
						req.sendResponse('Some error occured.', 500);
					}
				},
				currentUserId,
				targetUserId,
				relationType
			);
		});
	});
};

RelationshipHandler.prototype.getRelationship = function(target, callback, baseUserId, targetUserId, relationType) {
	var where = {};
	if (typeof(baseUserId) != 'undefined' && baseUserId != null) {
		where[RelationshipHandler.prototype.columnNameUserId] = baseUserId;
	}
	if (typeof(targetUserId) != 'undefined' && targetUserId != null) {
		where[RelationshipHandler.prototype.columnNameTargetUserId] = targetUserId;
	}
	if (typeof(relationType) != 'undefined' && relationType != null) {
		where[RelationshipHandler.prototype.columnNameRelationType] = relationType;
	}

	var sort = {};
	sort[RelationshipHandler.prototype.columnNameUserId] = 1;
	sort[RelationshipHandler.prototype.columnNameTargetUserId] = 1;
	sort[RelationshipHandler.prototype.columnNameRelationType] = 1;

	RelationshipHandler.prototype.persistor.find(
		function(ret) {
			var res = {};
			if (ret['status'] === 'ok') {
				res['status'] = 'ok';
				res['count'] = ret['number'];
				res['results'] = [];
				for (var i=0; i<ret['results'].length; i++) {
					res['results'].push(ret['results'][i]);
				}
			}
			if (typeof(callback) != 'undefined' && callback != null) {
				callback.call(target, res);
			}
		},
		this.collectionName,
		where,
		null,
		sort,
		null
	);

};

RelationshipHandler.prototype.destroy = function(req) {
	this.destroyInternal(req);
};

function getRelationshipHandler() {
	var u = new RelationshipHandler();
	return u;
}
