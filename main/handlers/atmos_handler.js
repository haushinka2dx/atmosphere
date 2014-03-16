load('main/handlers/request_handler.js');
load('main/core/persistor.js');

function AtmosHandler(cName) {
	CommonHandler.apply(this);
	atmos.log("AtmosHandler constructor was called with " + cName);
	this.collectionName = cName;
}
AtmosHandler.prototype = Object.create(CommonHandler.prototype);
AtmosHandler.prototype.constructor = AtmosHandler;

AtmosHandler.prototype.sendInternal = function(req, dataJSON) {
	if (Object.keys(dataJSON).length > 0) {
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

AtmosHandler.prototype.createBlankResponseInfo = function() {
	var actions = ResponseAction.prototype.all();
	var info = {};
	for (var i=0; i<actions.length; i++) {
		info[actions[i]] = new Array();
	}
	return info;
};
