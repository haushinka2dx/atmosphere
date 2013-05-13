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
	var cond = req.getQueryValue(AtmosHandler.prototype.paramNameSearchCondition);
	if (cond != null) {
		where = JSON.parse(cond);
	}
	AtmosHandler.prototype.persistor.find(function(ret) {
		req.sendResponse(JSON.stringify(ret));
	}, this.collectionName, where);
};

AtmosHandler.prototype.send = function(req) {
	req.getBodyAsJSON(this, function(bodyJSON) {
		atmos.log('bodyJSON: ' + JSON.stringify(bodyJSON));
		if (Object.keys(bodyJSON).length > 0) {
			Messages.prototype.persistor.insert(
				function(replyJSON) {
					req.sendResponse(JSON.stringify(replyJSON));
				},
				this.collectionName,
				bodyJSON
			);
		}
		else {
			req.sendResponse('');
		}
	});
};

AtmosHandler.prototype.destroy = function(req) {
	req.getBodyAsJSON(this, function(bodyJSON) {
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
	});
};

