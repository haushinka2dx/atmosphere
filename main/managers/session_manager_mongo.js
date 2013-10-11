var vertx = require('vertx');
load('main/core/constants.js');
load('main/core/persistor.js');

var SessionManager = function() {
};
SessionManager.prototype = {
	pa : getConstants().sessionManagerAddress,

	eb : function() {
		var eb = vertx.eventBus;
		return eb;
	},

	persistor : getPersistor(),

	collectionName : 'sessions',

	start : function(callback) {
		SessionManager.prototype.persistor.insert(
			function(res) {
				atmos.log('start result: ' + JSON.stringify(res));
				var sessionId = null;
				if (res['status'] === 'ok') {
					sessionId = res['_id'];
				}
				callback(sessionId);
			},
			SessionManager.prototype.collectionName,
			{"name":"dummy"},
			getConstants().adminUserId
		);
	},

	destroy : function(callback, sessionId) {
		SessionManager.prototype.persistor.remove(
			function(res) {
				callback(res);
			},
			SessionManager.prototype.collectionName,
			sessionId
		);
	},

	getValue : function(callback, sessionId, key) {
		SessionManager.prototype.persistor.findOne(
			function(res) {
				atmos.log('res: ' + JSON.stringify(res));
				var value = null;
				if (res['status'] === 'ok' && res['results'].length === 1) {
					var doc = res['results'][0];
					Object.keys(doc).forEach(function(k, i, a) {
						if (k === key) {
							value = doc[k];
							return;
						}
					});
				}
				callback(value);
			},
			SessionManager.prototype.collectionName,
			sessionId
		);
	},

	getValues : function(callback, sessionId, keys) {
		atmos.log('SessionManager.getValues sessionId: ' + sessionId);
		SessionManager.prototype.persistor.findOne(
			function(res) {
				atmos.log('SessionManager findOne result: ' + JSON.stringify(res));
				var values = {};
				if (res['status'] === 'ok' && res['number'] === 1) {
					var doc = res['results'][0];
					Object.keys(doc).forEach(function(k, i, a) {
						if (keys.indexOf(k) > -1) {
							values[k] = doc[k];
						}
					});
				}
				callback(values);
			},
			SessionManager.prototype.collectionName,
			sessionId
		);
	},

	putValue : function(callback, sessionId, key, value) {
		var data = {};
		data[key] = value;
		var updateInfo = {};
		updateInfo['$set'] = data;
		SessionManager.prototype.persistor.update(
			function(res) {
				var result = false;
				if (res['status'] === 'ok') {
					result = true;
				}
				callback(result);
			},
			SessionManager.prototype.collectionName,
			sessionId,
			updateInfo
		);
	},

	putValues : function(callback, sessionId, keyValues) {
		var data = {};
		Object.keys(keyValues).forEach(function(key, i, a) {
			data[key] = keyValues[key];
		});
		var updateInfo = {};
		updateInfo['$set'] = data;
		atmos.log('[SessionManager.putValues] store values to session[' + sessionId + '] : ' + JSON.stringify(updateInfo));
		SessionManager.prototype.persistor.update(
			function(res) {
				atmos.log('[SessionManager.putValues] store values result: ' + JSON.stringify(res));
				var result = false;
				if (res['status'] === 'ok') {
					result = true;
				}
				callback(result);
			},
			SessionManager.prototype.collectionName,
			sessionId,
			updateInfo
		);
	}
};

function getSessionManager() {
	var m = new SessionManager();
	return m;
}
