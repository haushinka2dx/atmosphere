load('atmosphere.js');

var CommonHandler = function() {};
CommonHandler.prototype = {
	paramNameSearchCondition: "where",
	paramNameUpdateInformation: "update_info",
	persistor: atmos.persistor,
	getParamValue: function getParamValue(req, name) {
		var ret = null;
		var params = req.params();
		for (var key in params) {
			if (key == name) {
				ret = params[key];
				break;
			}
		}
		return ret;
	},
	getParamValues: function getParamValues(req) {
		var ret = {};
		var params = req.params();
		for (var key in params) {
			ret[key] = params[key];
			atmos.log("[" + key + "] " + params[key]);
		}
		return ret;
	},
	sendResponse: function(req, body) {
		req.response.putAllHeaders(
			{
				//'Content-Type': 'text/html; charset=UTF-8'
				'Content-Type': 'application/json; charset=UTF-8'
			}
		);
		req.response.end(body);
	},
}
