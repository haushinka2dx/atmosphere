load('atmos_handler.js');

function Announce() {
	AtmosHandler.apply(this, [ "announce" ]);
}
Announce.prototype = Object.create(AtmosHandler.prototype);
Announce.prototype.constructor = Announce;

function getAnnounceHandler() {
	var announce = new Announce();
	return announce;
}
