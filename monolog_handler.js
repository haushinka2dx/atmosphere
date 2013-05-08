load('atmos_handler.js');

function Monolog() {
	AtmosHandler.apply(this, [ "monolog" ]);
}
Monolog.prototype = Object.create(AtmosHandler.prototype);
Monolog.constructor = Monolog;

function getMonologHandler() {
	var m = new Monolog();
	return m;
}
