load('atmos_handler.js');

var Monolog = function() {};
Monolog.prototype = new AtmosHandler();

function getMonologHandler() {
	var m = new Monolog();
	return m;
}
