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

	pk: "_id",

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
	},
	
	insert: function(callback, collName, document) {
		Persistor.prototype.eb().send(
			Persistor.prototype.pa,
			{
				"action": "save",
				"collection": collName,
				"document": document
			},
			callback
		);
	},

	update: function(callback, collName, id, document) {
		var criteria = {};
		criteria[Persistor.prototype.pk] = id;
		Persistor.prototype.eb().send(
			Persistor.prototype.pa,
			{
				"action": "update",
				"collection": collName,
				"criteria": criteria,
				"objNew": document,
				"upsert": false,
				"multi": false
			},
			callback
		);
	},

	updateByCondition: function(callback, collName, criteria, updateInfo) {
		Persistor.prototype.eb().send(
			Persistor.prototype.pa,
			{
				"action": "update",
				"collection": collName,
				"criteria": criteria,
				"objNew": updateInfo,
				"upsert": false,
				"multi": true
			},
			callback
		);
	},
}

function getPersistor() {
	var p = new Persistor();
	return p;
}
