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

	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var targetUserId = req.getQueryValue(RelationshipHandler.prototype.paramNameTargetUserId);
			if (!atmos.can(targetUserId)) {
				targetUserId = currentUserId;
			}
	
			var speakersCallback = atmos.createCallback(
				function(speakerUserIds) {
					req.sendResponse(JSON.stringify(speakerUserIds));
				},
				this
			);
	
			atmos.user.getSpeakers(
				speakersCallback,
				targetUserId
			);
		},
		this
	);
	req.getCurrentUserId(
		getCurrentUserIdCallback
	);
};

RelationshipHandler.prototype.listeners = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var targetUserId = req.getQueryValue(RelationshipHandler.prototype.paramNameTargetUserId);
			if (!atmos.can(targetUserId)) {
				targetUserId = currentUserId;
			}
	
			var listenersCallback = atmos.createCallback(
				function(listenerUserIds) {
					req.sendResponse(JSON.stringify(listenerUserIds));
				},
				this
			);
	
			atmos.user.getListeners(
				listenersCallback,
				targetUserId
			);
		},
		this
	);
	req.getCurrentUserId(
		getCurrentUserIdCallback
	);
};

RelationshipHandler.prototype.createRelationship = function(req, relationType) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var targetUserId = bodyJSON[RelationshipHandler.prototype.paramNameTargetUserId];
			
					if (!atmos.can(targetUserId)) {
						req.sendResponse("'target_user_id' must be assigned.", 400);
					}
		
					var userCallback = atmos.createCallback(
						function(currentUserInfo) {
							if (atmos.can(currentUserInfo)) {
								var alreadyTargetUserIds = [];
								if (relationType === this.relationTypeListen) {
									alreadyTargetUserIds = currentUserInfo[UserManager.prototype.cnRelation][UserManager.prototype.cnRelationTypeListen];
								}
								if (alreadyTargetUserIds.indexOf(targetUserId) === -1) {
									var addResultCallback = atmos.createCallback(
										function(addResult) {
											req.sendResponse(JSON.stringify(addResult));
										},
										this
									);
									var addFunc = null;
									if (relationType === this.relationTypeListen) {
										atmos.user.addSpeaker(
											addResultCallback,
											currentUserId,
											targetUserId
										);
									}
								}
								else {
									req.sendResponse('You already have ' + relationType + ' relationship with ' + targetUserId + '.', 400);
								}
							}
							else {
								req.sendResponse('Some error occured.', 500);
							}
						},
						this
					);
		
					atmos.user.getUser(
						userCallback,
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

RelationshipHandler.prototype.destroy = function(req) {
	req.sendResponse("This api was not implemented.", 400);
	//this.destroyInternal(req);
};

function getRelationshipHandler() {
	var u = new RelationshipHandler();
	return u;
}
