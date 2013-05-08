load('request_handler.js');

function AtmosHandler(cName) {
	CommonHandler.apply(this);
	atmos.log("AtmosHandler constructor was called with " + cName);
	this.collectionName = cName;
}
AtmosHandler.prototype = Object.create(CommonHandler.prototype);
AtmosHandler.prototype.constructor = AtmosHandler;

AtmosHandler.prototype.timeline = function(req) {
	var where = {};
	var cond = AtmosHandler.prototype.getParamValue(req, AtmosHandler.prototype.paramNameSearchCondition);
	if (cond != null) {
		where = JSON.parse(cond);
	}
	AtmosHandler.prototype.persistor.find(function(ret) {
		AtmosHandler.prototype.sendResponse(req, JSON.stringify(ret));
	}, this.collectionName, where);
};

AtmosHandler.prototype.send = function(req) {
	AtmosHandler.prototype.getBodyAsJSON(req, this, function(bodyJSON) {
		if (Object.keys(bodyJSON).length > 0) {
			AtmosHandler.prototype.persistor.insert(function(replyJSON) {
				AtmosHandler.prototype.sendResponse(req, JSON.stringify(replyJSON));
			}, this.collectionName, bodyJSON);
		} else {
			AtmosHandler.prototype.sendResponse(req, '');
		}
	});
};

AtmosHandler.prototype.talk = function(req) {
	AtmosHandler.prototype.say(req);
};
AtmosHandler.prototype.destroy = function(req) {
	AtmosHandler.prototype.getBodyAsJSON(req, this, function(bodyJSON) {
		atmos.log('Received body data: ' + JSON.stringify(bodyJSON));
		var id = bodyJSON[AtmosHandler.prototype.persistor.pk];
		if (id != null) {
			try {
				AtmosHandler.prototype.persistor.remove(function(replyJSON) {
					AtmosHandler.prototype.sendResponse(req, JSON.stringify(replyJSON));
				}, this.collectionName, id);
			} catch (ex) {
				atmos.log(ex);
				var res = AtmosHandler.prototype.createResponse(AtmosHandler.prototype.returnCodeSystemError, ex.message);
				AtmosHandler.prototype.sendResponse(req, JSON.stringify(res), 500);
			}
		} else {
			var res = AtmosHandler.prototype.createResponse(AtmosHandler.prototype.returnCodeArgumentMissingError, 'Destroy requires "_id"');
			AtmosHandler.prototype.sendResponse(req, JSON.stringify(res), 400);
		}
	});
};

