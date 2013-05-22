load('atmos_handler.js');


function Messages() {
	var collectionName = "messages";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Messages.prototype = Object.create(AtmosHandler.prototype);
Messages.prototype.constructor = Messages;

Messages.prototype.timeline = function(req) {
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
