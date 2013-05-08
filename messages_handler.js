load('atmos_handler.js');


var collectionName = "messages";
var Messages = function() {
	
	var commandHandler = new CommonHandler();
	
	Messages.prototype.say = function(req) {
		commandHandler.getBodyAsJSON(req, function(bodyJSON) {
			
			if (Object.keys(bodyJSON).length > 0) {
				commandHandler.persistor.insert(
						function(replyJSON) {
							commandHandler.sendResponse(req, JSON.stringify(replyJSON));
						},
						collectionName,
						bodyJSON
				);
			}
			else {
				commandHandler.sendResponse(req, '');
			}
		});
	};
};

Messages.prototype = new AtmosHandler(collectionName);

function getMessagesHandler() {
	var m = new Messages();
	return m;
}
