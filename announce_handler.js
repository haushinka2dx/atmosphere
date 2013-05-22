load('atmos_handler.js');

function Announce() {
	var collectionName = "announce";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Announce.prototype = Object.create(AtmosHandler.prototype);
Announce.prototype.constructor = Announce;

Announce.prototype.timeline = function(req) {
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

Announce.prototype.send = function(req) {
	req.getBodyAsJSON(this, function(bodyJSON) {
		var msg = bodyJSON['message'];

		// extract group_ids from message
		var groupIds = this.extractGroupIds(msg);

		var dataJSON = {};
		dataJSON['message'] = msg;
		dataJSON['addresses'] = groupIds;
		this.sendInternal(req, dataJSON);
	});
};

Announce.prototype.destroy = function(req) {
	this.destroyInternal(req);
};

Announce.prototype.response = function(req) {
	this.responseInternal(req);
};

Announce.prototype.extractGroupIds = function(msg) {
	var groupIdList = new Array();
	var pattern = /[^@.-_a-zA-Z0-9]@@([a-zA-Z0-9.-_]+)/g;
	var tempMsg = ' ' + msg + ' ';
	var groupId;
	while (groupId = pattern.exec(tempMsg)) {
		groupIdList.push(groupId[1]);
	}
	return groupIdList;
};

function getAnnounceHandler() {
	var announce = new Announce();
	return announce;
}
