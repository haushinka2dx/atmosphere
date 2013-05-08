load('atmos_handler.js');

function Private() {
	AtmosHandler.apply(this, [ "private" ]);
}
Private.prototype = Object.create(AtmosHandler.prototype);
Private.prototype.constructor = Private;

function getPrivateHandler() {
	var private = new Private();
	return private;
}
