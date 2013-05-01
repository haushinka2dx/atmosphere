load('atmosphere.js');

var CommonHandler = function() {
};
CommonHandler.prototype = {
	returnCodeArgumentMissingError : 110,
	returnMessageArgumentMissingError : "There are no required argument(s).",
	returnCodeArgumentInvalidFormatError : 120,
	returnMessageArgumentInvalidFormatError : "Some argument(s) are not correct format.",
	returnCodeSystemError : 999,
	returnMessageSystemError : "Unexpected error occured.",

	paramNameSearchCondition : "where",
	paramNameUpdateInformation : "update_info",
	persistor : atmos.persistor,
	getParamValue : function(req, name) {
		var ret = null;
		var params = req.params();
		for ( var key in params) {
			if (key == name) {
				ret = params[key];
				break;
			}
		}
		return ret;
	},
	getParamsAsJSON : function(req) {
		var ret = {};
		var params = req.params();
		for ( var key in params) {
			ret[key] = params[key];
			atmos.log("[" + key + "] " + params[key]);
		}
		return ret;
	},
	getBodyAsJSON : function(req, callback) {
		req.dataHandler(function(buffer) {
			var bodyJSON;
			var keyCount = 0;
			if (buffer.length() > 0) {
				bodyJSON = JSON.parse(buffer);
				// FIXME In What are you using here 'key'?
				for ( var key in bodyJSON) {
					keyCount += 1;
				}
			} else {
				bodyJSON = {};
			}
			bodyJSON["__count__"] = keyCount;
			callback(bodyJSON);
		});
	},
	sendResponse : function(req, body, statusCode) {
		if (typeof (statusCode) != 'undefined' && statusCode != null) {
			req.response.statusCode = statusCode;
		}
		req.response.putAllHeaders({
			// 'Content-Type': 'text/html; charset=UTF-8'
			'Content-Type' : 'application/json; charset=UTF-8'
		});
		req.response.end(body);
	},
	createResponse : function(code, additionalMsg) {
		var r = {};
		r['code'] = code;
		r['msg'] = CommonHandler.prototype.getErrorMsg(code);
		r['remarks'] = additionalMsg;
		return r;
	},
	getErrorMsg : function(code) {
		if (code == CommonHandler.prototype.returnCodeArgumentMissingError) {
			return CommonHandler.prototype.returnMessageArgumentMissingError;
		} else if (code == CommonHandler.prototype.returnCodeArgumentInvalidFormatError) {
			return CommonHandler.prototype.returnMessageArgumentInvalidFormatError;
		} else {
			return CommonHandler.prototype.returnMessageSystemError;
		}
	}
};
