load('atmos_handler.js');

function Private() {
	var collectionName = "private";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Private.prototype = Object.create(AtmosHandler.prototype);
Private.prototype.constructor = Private;

Private.prototype.timeline = function(req) {
	this.timelineInternal(req);
};

Private.prototype.send = function(req) {
	req.getBodyAsJSON(this, function(bodyJSON) {
		var to = bodyJSON['to_user_id'];
		var msg = bodyJSON['message'];
		var dataJSON = {};
		dataJSON['to_user_id'] = to;
		dataJSON['message'] = msg;
		this.sendInternal(req, dataJSON);
	});
};

Private.prototype.destroy = function(req) {
	this.destroyInternal(req);
};

function getPrivateHandler() {
	var private = new Private();
	return private;
}
