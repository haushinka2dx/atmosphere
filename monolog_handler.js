load('atmos_handler.js');

var collectionName = "monolog";
var Monolog = function() {};
Monolog.prototype = new AtmosHandler(collectionName);

function getMonologHandler() {
	var m = new Monolog();
	return m;
}
