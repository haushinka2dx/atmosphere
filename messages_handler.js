load('atmos_handler.js');


function Messages() {
	var collectionName = "messages";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Messages.prototype = Object.create(AtmosHandler.prototype);
Messages.prototype.constructor = Messages;

Messages.prototype.say = function(req) {
	Messages.prototype.getBodyAsJSON(req, this, function(bodyJSON) {
		if (Object.keys(bodyJSON).length > 0) {
			Messages.prototype.persistor.insert(
					function(replyJSON) {
						Messages.prototype.sendResponse(req, JSON.stringify(replyJSON));
					},
					this.collectionName,
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
