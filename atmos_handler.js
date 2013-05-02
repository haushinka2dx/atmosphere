load('atmosphere.js');
load('request_handler.js');

var AtmosHandler = function() {};

AtmosHandler.prototype = new CommonHandler();

AtmosHandler.prototype.timeline = function(req) {
	var where = {};
	var cond = AtmosHandler.prototype.getParamValue(req, AtmosHandler.prototype.paramNameSearchCondition);
	if (cond != null) {
		where = JSON.parse(cond);
	}
	AtmosHandler.prototype.persistor.find(
		function(ret) {
			AtmosHandler.prototype.sendResponse(req, JSON.stringify(ret));
		},
		getCollectionName(req),
		where
	);
};

AtmosHandler.prototype.send = function(req) {
	AtmosHandler.prototype.getBodyAsJSON(req, function(bodyJSON) {
		if (bodyJSON['__count__'] > 0) {
			AtmosHandler.prototype.persistor.insert(
				function(replyJSON) {
					AtmosHandler.prototype.sendResponse(req, JSON.stringify(replyJSON));
				},
				getCollectionName(req),
				bodyJSON
			);
		}
		else {
			AtmosHandler.prototype.sendResponse(req, '');
		}
	});
};

AtmosHandler.prototype.talk = function(req) {
	AtmosHandler.prototype.say(req);
};
AtmosHandler.prototype.destroy = function(req) {
	AtmosHandler.prototype.getBodyAsJSON(req, function(bodyJSON) {
		atmos.log('Received body data: ' + JSON.stringify(bodyJSON));
		var id = bodyJSON[AtmosHandler.prototype.persistor.pk];
		if (id != null) {
			try {
				AtmosHandler.prototype.persistor.remove(
					function(replyJSON) {
						AtmosHandler.prototype.sendResponse(req, JSON.stringify(replyJSON));
					},
					getCollectionName(req),
					id
				);
			}
			catch (ex) {
				atmos.log(ex);
				var res = AtmosHandler.prototype.createResponse(AtmosHandler.prototype.returnCodeSystemError, ex.message);
				AtmosHandler.prototype.sendResponse(req, JSON.stringify(res), 500);
			}
		}
		else {
			var res = AtmosHandler.prototype.createResponse(AtmosHandler.prototype.returnCodeArgumentMissingError, 'Destroy requires "_id"');
			AtmosHandler.prototype.sendResponse(req, JSON.stringify(res), 400);
		}
	});
};

function getCollectionName(req) {
	return req.path.split("/")[1];
}

function getAtmosHandler() {
	var handler = new AtmosHandler();
	return handler;
}
