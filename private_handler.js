load('atmos_handler.js');

var Private = function() {};
Private.prototype = new AtmosHandler();

function getPrivateHandler() {
	var p = new Private();
	return p;
}
