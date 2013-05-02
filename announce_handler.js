load('atmos_handler.js');

var Announce = function() {};
Announce.prototype = new AtmosHandler();

function getAnnounceHandler() {
	var a = new Announce();
	return a;
}
