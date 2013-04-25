load('vertx.js');
load('atmos_debug.js');
load('persistor.js');

function getParamValue(req, name) {
	var ret = null;
	var params = req.params();
	for (var key in params) {
		if (key == name) {
			ret = params[key];
			break;
		}
	}
	return ret;
}

function getParamValues(req) {
	var logger = vertx.logger;
	var ret = {};
	var params = req.params();
	for (var key in params) {
		ret[key] = params[key];
		plog(logger, "[" + key + "] " + params[key]);
	}
	return ret;
}

var Messages = function() {};
Messages.prototype = {
	paramNameSearchCondition: "where",
	collectionName: "messages",
	persistor: getPersistor(),
	timeline: function(req) {
		var where = {};
		var cond = getParamValue(req, Messages.prototype.paramNameSearchCondition);
		if (cond != null) {
			where = JSON.parse(cond);
		}
		Messages.prototype.persistor.find(
			function(ret) {
				req.response.end(JSON.stringify(ret));
			},
			Messages.prototype.collectionName,
			where
		);
	},
	say: function(req) {
		var logger = vertx.logger;
		var data = getParamValues(req);
		plog(logger, data);
		plog(logger, data['id_']);
		plog(logger, data.id_);
		plog(logger, JSON.stringify(data));
		// remove "id_" if exists
		delete(data['id_']);
//		var data = {"id":100, "contents":"message from " + req.uri};
		Messages.prototype.persistor.save(
			Messages.prototype.collectionName,
			//JSON.stringify(data)
			data
		);
		req.response.end();
	}
}

function getMessagesHandler() {
	var m = new Messages();
	return m;
}
