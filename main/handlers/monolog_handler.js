load('main/handlers/atmos_handler.js');

function Monolog() {
	var collectionName = "monolog";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Monolog.prototype = Object.create(AtmosHandler.prototype);
Monolog.constructor = Monolog;

Monolog.prototype.timeline = function(req) {
	var timelineInternalCallback = atmos.createCallback(
		function(timeline) {
			atmos.log(JSON.stringify(timeline));
			req.sendResponse(JSON.stringify(timeline));
		},
		this
	);
	this.getTimelineInternal(
		timelineInternalCallback,
		req
	);
};

Monolog.prototype.send = function(req) {
	var getBodyAsJSONCallback = atmos.createCallback(
		function(bodyJSON) {
			var msg = bodyJSON['message'];
			var dataJSON = {};
			dataJSON['message'] = msg;
			this.sendInternal(req, dataJSON);
		},
		this
	);
	req.getBodyAsJSON(
		getBodyAsJSONCallback
	);
};

Monolog.prototype.destroy = function(req) {
	this.destroyInternal(req);
};

function getMonologHandler() {
	var m = new Monolog();
	return m;
}
