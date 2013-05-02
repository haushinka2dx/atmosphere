load('atmos_handler.js');

var Messages = function() {};
Messages.prototype = new AtmosHandler();

Messages.prototype.say = function(req) {
	Messages.prototype.getBodyAsJSON(req, function(bodyJSON) {

		if (bodyJSON['__count__'] > 0) {
			Messages.prototype.persistor.insert(
				function(replyJSON) {
					Messages.prototype.sendResponse(req, JSON.stringify(replyJSON));
				},
				getCollectionName(req),
				bodyJSON
			);
		}
		else {
			Messages.prototype.sendResponse(req, '');
		}
	});
};

function getMessagesHandler() {
	var m = new Messages();
	return m;
}
