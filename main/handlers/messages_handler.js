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
			req.sendResponse(JSON.stringify(timeline));
		},
		this
	);

	var cond = req.getQueryValue(AtmosHandler.prototype.paramNameSearchCondition);
	var futureThan = req.getQueryValue(AtmosHandler.prototype.paramNameFutureThan);
	var pastThan = req.getQueryValue(AtmosHandler.prototype.paramNamePastThan);
	var count = parseInt(req.getQueryValue(AtmosHandler.prototype.paramNameCount), 10);

	// default sort new -> old
	var sort = {};
	sort[AtmosHandler.prototype.persistor.createdAt] = -1;
	atmos.messages.getMessages(
		timelineInternalCallback,
		cond,
		null,
		futureThan,
		pastThan,
		count
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
						var cond = req.getQueryValue(AtmosHandler.prototype.paramNameSearchCondition);
						var futureThan = req.getQueryValue(AtmosHandler.prototype.paramNameFutureThan);
						var pastThan = req.getQueryValue(AtmosHandler.prototype.paramNamePastThan);
						var count = parseInt(req.getQueryValue(AtmosHandler.prototype.paramNameCount), 10);
						var additionalCondition = this.persistor.createInCondition(
							'created_by',
							speakerUserIds
						);
						var timelineInternalCallback = atmos.createCallback(
							function(timeline) {
								req.sendResponse(JSON.stringify(timeline));
							},
							this
						);
						atmos.messages.getMessages(
							timelineInternalCallback,
							cond,
							additionalCondition,
							futureThan,
							pastThan,
							count
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
			var cond = req.getQueryValue(AtmosHandler.prototype.paramNameSearchCondition);
			var futureThan = req.getQueryValue(AtmosHandler.prototype.paramNameFutureThan);
			var pastThan = req.getQueryValue(AtmosHandler.prototype.paramNamePastThan);
			var count = parseInt(req.getQueryValue(AtmosHandler.prototype.paramNameCount), 10);
			var addressesIn = {};
			addressesIn['$in'] = [ currentUserId ];
			var additionalCondition = {};
			additionalCondition['addresses.users'] = addressesIn;
	
			var timelineInternalCallback = atmos.createCallback(
				function(timeline) {
					req.sendResponse(JSON.stringify(timeline));
				},
				this
			);
			atmos.messages.getMessages(
				timelineInternalCallback,
				cond,
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

Messages.prototype.send = function(req) {
	var getCurrentUserIdCallback = atmos.createCallback(
		function(currentUserId) {
			var getBodyAsJSONCallback = atmos.createCallback(
				function(bodyJSON) {
					var msg = bodyJSON['message'];
					var replyTo = bodyJSON['reply_to'];
			
					// extract user_ids from message
					var addressesUsers = this.extractAddressesUsers(msg);
					var addressesGroups = this.extractAddressesGroups(msg);

					var messageType = '';
					if (addressesGroups.length > 0) {
						messageType = atmos.messages.messageTypeAnnounce;
					}
					else {
						messageType = atmos.messages.messageTypeMessage;
					}
			
					var sendMessageCallback = atmos.createCallback(
						function(res) {
							req.sendResponse(JSON.stringify(res));
						},
						this
					);
					atmos.messages.send(
						sendMessageCallback,
						msg,
						messageType,
						addressesUsers,
						addressesGroups,
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

Messages.prototype.destroy = function(req) {
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
						atmos.messages.destroy(
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

Messages.prototype.response = function(req) {
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
					atmos.messages.addResponse(
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

Messages.prototype.removeResponse = function(req) {
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
					atmos.messages.removeResponse(
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

Messages.prototype.extractAddressesUsers = function(msg) {
	var addressList = new Array();
	var pattern = /[^@.\-_a-zA-Z0-9]@([a-zA-Z0-9.\-_]+)/g;
	var tempMsg = ' ' + msg + ' ';
	var address;
	while (address = pattern.exec(tempMsg)) {
		addressList.push(address[1]);
	}
	return addressList;
};

Messages.prototype.extractAddressesGroups = function(msg) {
	var addressList = new Array();
	var pattern = /[^@.\-_a-zA-Z0-9]@@([a-zA-Z0-9.\-_]+)/g;
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
