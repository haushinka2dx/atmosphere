load('atmos_handler.js');

var collectionName = "private";
var Private = function() {};

Private.prototype = new AtmosHandler(collectionName);

function getPrivateHandler() {
	var private = new Private();
	return private;
}
