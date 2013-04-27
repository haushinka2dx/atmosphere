load('atmosphere.js');

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
	var ret = {};
	var params = req.params();
	for (var key in params) {
		ret[key] = params[key];
		atmos.log("[" + key + "] " + params[key]);
	}
	return ret;
}

var Messages = function() {};
Messages.prototype = {
	paramNameSearchCondition: "where",
	collectionName: "messages",
	persistor: atmos.persistor,
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
		var data = getParamValues(req);
		// remove "id_" if exists
		delete(data['id_']);
		atmos.log(JSON.stringify(data));

		Messages.prototype.persistor.save(
			Messages.prototype.collectionName,
			data
		);
		req.response.end();
	}
}

function getMessagesHandler() {
	var m = new Messages();
	return m;
}
