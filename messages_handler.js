load('atmosphere.js');
load('request_handler.js');

var Messages = function() {};
Messages.prototype = new CommonHandler();

Messages.prototype.collectionName = "messages";
Messages.prototype.timeline = function(req) {
	var where = {};
	var cond = Messages.prototype.getParamValue(req, Messages.prototype.paramNameSearchCondition);
	if (cond != null) {
		where = JSON.parse(cond);
	}
	Messages.prototype.persistor.find(
		function(ret) {
			Messages.prototype.sendResponse(req, JSON.stringify(ret));
		},
		Messages.prototype.collectionName,
		where
	);
};
Messages.prototype.say = function(req) {
	Messages.prototype.getBodyAsJSON(req, function(bodyJSON) {

		if (bodyJSON['__count__'] > 0) {
			Messages.prototype.persistor.insert(
				function(replyJSON) {
					Messages.prototype.sendResponse(req, JSON.stringify(replyJSON));
				},
				Messages.prototype.collectionName,
				bodyJSON
			);
		}
		else {
			Messages.prototype.sendResponse(req, '');
		}
	});
};
Messages.prototype.talk = function(req) {
	Messages.prototype.say(req);
};
Messages.prototype.destroy = function(req) {
	Messages.prototype.getBodyAsJSON(req, function(bodyJSON) {
		atmos.log('Received body data: ' + JSON.stringify(bodyJSON));
		var id = bodyJSON[Messages.prototype.persistor.pk];
		if (id != null) {
			try {
				Messages.prototype.persistor.remove(
					function(replyJSON) {
						Messages.prototype.sendResponse(req, JSON.stringify(replyJSON));
					},
					Messages.prototype.collectionName,
					id
				);
			}
			catch (ex) {
				atmos.log(ex);
				var res = Messages.prototype.createResponse(Messages.prototype.returnCodeSystemError, ex.message);
				Messages.prototype.sendResponse(req, JSON.stringify(res), 500);
			}
		}
		else {
			var res = Messages.prototype.createResponse(Messages.prototype.returnCodeArgumentMissingError, 'Destroy requires "_id"');
			Messages.prototype.sendResponse(req, JSON.stringify(res), 400);
		}
	});
};

function getMessagesHandler() {
	var m = new Messages();
	return m;
}
