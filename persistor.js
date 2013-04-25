load('vertx.js');
load('atmos_debug.js');
load('constants.js');

var Persistor = function() {};
Persistor.prototype = {
	pa: getConstants().persistorAddress,

	eb: function() {
		var eb = vertx.eventBus;
		return eb;
	},

	save: function(collName, document) {
		Persistor.prototype.eb().send(
			Persistor.prototype.pa,
			{
				"action": "save",
				"collection": collName,
				"document": document
			}
		);
	},

	find: function(callback, collName, where) {
		Persistor.prototype.eb().send(
			Persistor.prototype.pa,
			{
				"action": "find",
				"collection": collName,
				"matcher": where
			},
			callback
		);
	}
}

function getPersistor() {
	var p = new Persistor();
	return p;
}
