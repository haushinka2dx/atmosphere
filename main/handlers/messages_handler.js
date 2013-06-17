load('main/handlers/atmos_handler.js');

function Messages() {
	var collectionName = "messages";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Messages.prototype = Object.create(AtmosHandler.prototype);
Messages.prototype.constructor = Messages;

Messages.prototype.globalTimeline = function(req) {
	var timelineInternalCallback = atmos.createCallback(
		function(timeline) {
			var appendResponseCallback = atmos.createCallback(
				function(responsedTimelineElements) {
					timeline['results'] = responsedTimelineElements;
					req.sendResponse(JSON.stringify(timeline));
				},
				this
			);
			this.appendResponseInfo(
				appendResponseCallback,
				timeline['results'],
				this.collectionName
			);
		},
		this
	);

	this.getTimelineInternal(
		timelineInternalCallback,
		req
	);
};

Messages.prototype.focusedTimeline = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			//自分がListenしてるユーザーを取得
			var getSpeakersCallback = atmos.createCallback(
				function(speakerUserIds) {
					if (speakerUserIds.length === 0) {
						req.sendResponse('You listen nobody.', 400);
					}
					else {
						var additionalCondition = this.persistor.createInCondition(
							'created_by',
							speakerUserIds
						);
						var timelineInternalCallback = atmos.createCallback(
							function(timeline) {
								var appendResponseCallback = atmos.createCallback(
									function(responsedTimelineElements) {
										timeline['results'] = responsedTimelineElements;
										req.sendResponse(JSON.stringify(timeline));
									},
									this
								);
								this.appendResponseInfo(
									appendResponseCallback,
									timeline['results'],
									this.collectionName
								);
							},
							this
						);
						this.getTimelineInternal(
							timelineInternalCallback,
							req,
							additionalCondition
						);
					}
				},
				this
			);
			atmos.user.getSpeakers(
				getSpeakersCallback,
				currentUserId
			);
		},
		this
	);
	req.getCurrentUserId(
		getCurrentUserIdCallback
	);
};

Messages.prototype.talkTimeline = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var addressesIn = {};
			addressesIn['$in'] = [ currentUserId ];
			var additionalCondition = {};
			additionalCondition['addresses'] = addressesIn;
	
			var timelineInternalCallback = atmos.createCallback(
				function(timeline) {
					var appendResponseCallback = atmos.createCallback(
						function(responsedTimelineElements) {
							timeline['results'] = responsedTimelineElements;
							req.sendResponse(JSON.stringify(timeline));
						},
						this
					);
	
					this.appendResponseInfo(
						appendResponseCallback,
						timeline['results'],
						this.collectionName
					);
				},
				this
			);
			this.getTimelineInternal(
				timelineInternalCallback,
				req,
				additionalCondition
			);
		},
		this
	);
	req.getCurrentUserId(
		getCurrentUserIdCallback
	);
};

Messages.prototype.send = function(req) {
	var getBodyAsJSONCallback = atmos.createCallback(
		function(bodyJSON) {
			var msg = bodyJSON['message'];
			var replyTo = bodyJSON['reply_to'];
	
			// extract user_ids from message
			var addresses = this.extractAddresses(msg);
	
			var dataJSON = {};
			dataJSON['message'] = msg;
			dataJSON['addresses'] = addresses;
			dataJSON['reply_to'] = replyTo;
			this.sendInternal(req, dataJSON);
		},
		this
	);
	req.getBodyAsJSON(
		getBodyAsJSONCallback
	);
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
