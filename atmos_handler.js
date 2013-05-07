load('request_handler.js');

var AtmosHandler = function(cName) {
	vertx.logger.info(cName);
	var commandHandler = new CommonHandler();

	AtmosHandler.prototype.timeline = function(req) {
		vertx.logger.info(cName);
		var where = {};
		var cond = commandHandler.getParamValue(req, commandHandler.paramNameSearchCondition);
		if (cond != null) {
			where = JSON.parse(cond);
		}
		commandHandler.persistor.find(function(ret) {
			commandHandler.sendResponse(req, JSON.stringify(ret));
		}, cName, where);
	};

	AtmosHandler.prototype.send = function(req) {
		commandHandler.getBodyAsJSON(req, function(bodyJSON) {
			if (bodyJSON['__count__'] > 0) {
				commandHandler.persistor.insert(function(replyJSON) {
					commandHandler.sendResponse(req, JSON.stringify(replyJSON));
				}, cName, bodyJSON);
			} else {
				commandHandler.sendResponse(req, '');
			}
		});
	};

	AtmosHandler.prototype.talk = function(req) {
		commandHandler.say(req);
	};
	AtmosHandler.prototype.destroy = function(req) {
		commandHandler.getBodyAsJSON(req, function(bodyJSON) {
			atmos.log('Received body data: ' + JSON.stringify(bodyJSON));
			var id = bodyJSON[AtmosHandler.prototype.persistor.pk];
			if (id != null) {
				try {
					commandHandler.persistor.remove(function(replyJSON) {
						commandHandler.sendResponse(req, JSON.stringify(replyJSON));
					}, cName, id);
				} catch (ex) {
					atmos.log(ex);
					var res = commandHandler.createResponse(commandHandler.returnCodeSystemError, ex.message);
					commandHandler.sendResponse(req, JSON.stringify(res), 500);
				}
			} else {
				var res = commandHandler.createResponse(commandHandler.returnCodeArgumentMissingError, 'Destroy requires "_id"');
				commandHandler.sendResponse(req, JSON.stringify(res), 400);
			}
		});
	};

};
