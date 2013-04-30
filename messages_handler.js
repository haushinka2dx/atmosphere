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
	var targetId = Messages.prototype.getParamValue(req, Messages.prototype.persistor.pk);
	if (targetId != null) {
		req.dataHandler(function(buffer) {
			if (buffer.length() > 0) {
				atmos.log('Received body data: ' + buffer);
				var bodyJSON = JSON.parse(buffer);
	
				Messages.prototype.persistor.update(
					function(replyJSON) {
						Messages.prototype.sendResponse(req, JSON.stringify(replyJSON));
					},
					Messages.prototype.collectionName,
					targetId,
					bodyJSON
				);
			}
			else {
				Messages.prototype.sendResponse(req, '');
			}
		});
	}
	else {
		req.dataHandler(function(buffer) {
			if (buffer.length() > 0) {
				atmos.log('Received body data: ' + buffer);
				var bodyJSON = JSON.parse(buffer);
	
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
	}
};
Messages.prototype.talk = function(req) {
	req.dataHandler(function(buffer) {
		if (buffer.length() > 0) {
			atmos.log('Received body data: ' + buffer);
			var bodyJSON = JSON.parse(buffer);

			var whereJSON = bodyJSON[Messages.prototype.persistor.paramNameSearchCondition];
			var updateInfoJSON = bodyJSON[Messages.prototype.persistor.paramNameUpdateInformation];

			Messages.prototype.persistor.updateByCondition(
				function(replyJSON) {
					Messages.prototype.sendResponse(req, JSON.stringify(replyJSON));
				},
				Messages.prototype.collectionName,
				whereJSON,
				updateInfoJSON
			);
		}
		else {
			var res = {};
			res['msg'] = 'Update requires both "criteria" and "update_info"';
			Messages.prototype.sendResponse(req, JSON.stringify(res));
		}
	});
};

function getMessagesHandler() {
	var m = new Messages();
	return m;
}
