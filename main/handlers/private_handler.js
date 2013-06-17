load('main/handlers/atmos_handler.js');

function Private() {
	var collectionName = "private";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Private.prototype = Object.create(AtmosHandler.prototype);
Private.prototype.constructor = Private;

Private.prototype.timeline = function(req) {
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
};

Private.prototype.destroy = function(req) {
	this.destroyInternal(req);
};

Private.prototype.response = function(req) {
	this.responseInternal(req);
};

function getPrivateHandler() {
	var private = new Private();
	return private;
}
