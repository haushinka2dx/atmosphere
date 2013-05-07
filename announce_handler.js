load('atmos_handler.js');

var collectionName = "announce";
var Announce = function() {};
Announce.prototype = new AtmosHandler(collectionName);

function getAnnounceHandler() {
	var announce = new Announce();
	return announce;
}
