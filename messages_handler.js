load('atmos_handler.js');
load('relationship_handler.js');


function Messages() {
	var collectionName = "messages";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Messages.prototype = Object.create(AtmosHandler.prototype);
Messages.prototype.constructor = Messages;

Messages.prototype.globalTimeline = function(req) {
	this.getTimelineInternal(
		this,
		function(timeline) {
			this.appendResponseInfo(
				this,
				function(responsedTimelineElements) {
					timeline['results'] = responsedTimelineElements;
					req.sendResponse(JSON.stringify(timeline));
				},
				timeline['results'],
				this.collectionName
			);
		},
		req
	);
};

Messages.prototype.focusedTimeline = function(req) {
	req.getCurrentUserId(this, function(currentUserId) {
		//自分がListenしてるユーザーを取得
		var relationHandler = getRelationshipHandler();
		relationHandler.getSpeakers(
			this,
			function(res) {
				atmos.log('result of getSpeakers: ' + JSON.stringify(res));
				if (res['count'] == 0) {
					req.sendResponse('You listen nobody.', 400);
				}
				else {
					var speakerUserIds = new Array();
					var listenRelations = res['results'];
					for (var i=0; i<listenRelations.length; i++) {
						var listenRelation = listenRelations[i];
						speakerUserIds.push(listenRelation['target_user_id']);
					}
					var createdByIn = {};
					createdByIn['$in'] = speakerUserIds;
					var additionalCondition = {};
					additionalCondition['created_by'] = createdByIn;
					this.getTimelineInternal(
						this,
						function(timeline) {
							this.appendResponseInfo(
								this,
								function(responsedTimelineElements) {
									timeline['results'] = responsedTimelineElements;
									req.sendResponse(JSON.stringify(timeline));
								},
								timeline['results'],
								this.collectionName
							);
						},
						req,
						additionalCondition
					);
				}
			},
			currentUserId
		);
		
	});
};

Messages.prototype.talkTimeline = function(req) {
	req.getCurrentUserId(this, function(currentUserId) {
		var addressesIn = {};
		addressesIn['$in'] = [ currentUserId ];
		var additionalCondition = {};
		additionalCondition['addresses'] = addressesIn;
		this.getTimelineInternal(
			this,
			function(timeline) {
				this.appendResponseInfo(
					this,
					function(responsedTimelineElements) {
						timeline['results'] = responsedTimelineElements;
						req.sendResponse(JSON.stringify(timeline));
					},
					timeline['results'],
					this.collectionName
				);
			},
			req,
			additionalCondition
		);
	});
};

Messages.prototype.send = function(req) {
	req.getBodyAsJSON(this, function(bodyJSON) {
		var msg = bodyJSON['message'];
		var replyTo = bodyJSON['reply_to'];

		// extract user_ids from message
		var addresses = this.extractAddresses(msg);

		var dataJSON = {};
		dataJSON['message'] = msg;
		dataJSON['addresses'] = addresses;
		dataJSON['reply_to'] = replyTo;
		this.sendInternal(req, dataJSON);
	});
};

Messages.prototype.destroy = function(req) {
	this.destroyInternal(req);
};

Messages.prototype.response = function(req) {
	this.responseInternal(req);
};

Messages.prototype.extractAddresses = function(msg) {
	var addressList = new Array();
	var pattern = /[^@.-_a-zA-Z0-9]@([a-zA-Z0-9.-_]+)/g;
	var tempMsg = ' ' + msg + ' ';
	var address;
	while (address = pattern.exec(tempMsg)) {
		addressList.push(address[1]);
	}
	return addressList;
};

function getMessagesHandler() {
	var m = new Messages();
	return m;
}
