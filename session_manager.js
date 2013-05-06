load('vertx.js');
load('constants.js');

var SessionManager = function() {
};
SessionManager.prototype = {
	pa : getConstants().sessionManagerAddress,

	eb : function() {
		var eb = vertx.eventBus;
		return eb;
	},

	start : function(callback) {
		SessionManager.prototype.eb().send(
			SessionManager.prototype.pa,
			{ "action" : "start" },
			function(res) {
				atmos.log('start result: ' + JSON.stringify(res));
				var sessionId = null;
				if (res['status'] === 'ok') {
					sessionId = res['sessionId'];
				}
				callback(sessionId);
			}
		);
	},

	destroy : function(callback, sessionId) {
		SessionManager.prototype.eb().send(
			SessionManager.prototype.pa,
			{
				"action" : "destroy",
				"sessionId" : sessionId
			},
			function(res) {
				callback(res);
			}
		);
	},

	getValue : function(callback, sessionId, key) {
		SessionManager.prototype.eb().send(
			SessionManager.prototype.pa,
			{
				"action" : "get",
				"sessionId" : sessionId,
				"fields" : [ key ]
			},
			function(res) {
				atmos.log('res: ' + JSON.stringify(res));
				var value = null;
				if (res['status'] === 'ok') {
					for (var k in res['data']) {
						value = res['data'][k];
						break;
					}
				}
				callback(value);
			}
		);
	},

	getValues : function(callback, sessionId, keys) {
		SessionManager.prototype.eb().send(
			SessionManager.prototype.pa,
			{
				"action" : "get",
				"sessionId" : sessionId,
				"fields" : keys
			},
			function(res) {
				atmos.log('res: ' + JSON.stringify(res));
				var values = {};
				if (res['status'] === 'ok') {
					for (var k in res['data']) {
						values[k] = res['data'][k];
					}
				}
				callback(values);
			}
		);
	},

	putValue : function(callback, sessionId, key, value) {
		var dataJSON = {};
		dataJSON[key] = value;
		SessionManager.prototype.eb().send(
			SessionManager.prototype.pa,
			{
				"action" : "put",
				"sessionId" : sessionId,
				"data" : dataJSON
			},
			function(res) {
				var result = false;
				if (res['status'] === 'ok') {
					result = true;
				}
				callback(result);
			}
		);
	},

	putValues : function(callback, sessionId, keyValues) {
		var dataJSON = {};
		for (var k in keyValues) {
			dataJSON[k] = keyValues[k];
		}
		SessionManager.prototype.eb().send(
			SessionManager.prototype.pa,
			{
				"action" : "put",
				"sessionId" : sessionId,
				"data" : dataJSON
			},
			function(res) {
				var result = false;
				if (res['status'] === 'ok') {
					result = true;
				}
				callback(result);
			}
		);
	}
}

function getSessionManager() {
	var m = new SessionManager();
	return m;
}
