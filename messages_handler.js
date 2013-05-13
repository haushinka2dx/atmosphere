load('atmos_handler.js');


function Messages() {
	var collectionName = "messages";
	AtmosHandler.apply(this, [ collectionName ]);
	this.collectionName = collectionName;
}
Messages.prototype = Object.create(AtmosHandler.prototype);
Messages.prototype.constructor = Messages;

Messages.prototype.say = function(req) {
	req.getBodyAsJSON(this, function(bodyJSON) {
		atmos.log('bodyJSON: ' + JSON.stringify(bodyJSON));
		if (Object.keys(bodyJSON).length > 0) {
			var sessionId = req.getSessionId();
			atmos.auth.getCurrentUser(
				this,
				function(currentUserId) {
					Messages.prototype.persistor.insert(
						function(replyJSON) {
							req.sendResponse(JSON.stringify(replyJSON));
						},
						this.collectionName,
						bodyJSON,
						currentUserId
					);
				},
				sessionId
			);
		}
		else {
			req.sendResponse('');
		}
	});
};

function getMessagesHandler() {
	var m = new Messages();
	return m;
}
