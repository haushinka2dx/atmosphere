load('atmos_handler.js');

function Monolog() {
	var collectionName = "monolog";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Monolog.prototype = Object.create(AtmosHandler.prototype);
Monolog.constructor = Monolog;

Monolog.prototype.timeline = function(req) {
	this.getTimelineInternal(
		this,
		function(timeline) {
			req.sendResponse(JSON.stringify(timeline));
		},
		req
	);
};

Monolog.prototype.send = function(req) {
	req.getBodyAsJSON(this, function(bodyJSON) {
		var msg = bodyJSON['message'];
		var dataJSON = {};
		dataJSON['message'] = msg;
		this.sendInternal(req, dataJSON);
	});
};

Monolog.prototype.destroy = function(req) {
	this.destroyInternal(req);
};

function getMonologHandler() {
	var m = new Monolog();
	return m;
}
