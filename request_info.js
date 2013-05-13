load('vertx.js');
load('constants.js');

function RequestInfo(req) {
	this.req = req;
	this.query = req.query;
}
//RequestInfo.prototype = Object.create(Object.prototype);
RequestInfo.prototype.constructor = RequestInfo;

RequestInfo.prototype.headerNameSessionId = getConstants().headerNameSessionId;

RequestInfo.prototype.getSessionId = function() {
	if (this.sessionId == null) {
		this.sessionId = this.req.headers()[this.headerNameSessionId];
	}
	return this.sessionId;
};

//	paramNameSearchCondition : "where",
//	paramNameUpdateInformation : "update_info",
//	persistor : atmos.persistor,
//

RequestInfo.prototype.getQueryValue = function(name) {
	var queryJSON = this.getQueryAsJSON();
	return queryJSON[name];
};

RequestInfo.prototype.getQueryAsJSON = function() {
	if (this.queryAsJSON) {
		return this.queryAsJSON;
	}
	this.queryAsJSON = {};
	var keyValues = /[^&]+/.exec(this.req.query);
	for (var i = 0; i < keyValues.length; i++) {
		var keyValue = /[^=]+/.exec(keyValues[i]);
		var key = keyValue[0];
		var value = keyValue.length > 1 ? keyValue[1] : '';
		this.queryAsJSON[key] = value;
	}
	return this.queryAsJSON;
};

RequestInfo.prototype.getParamValue = function(name) {
	var ret = this.req.params()[name];
	return ret;
};

RequestInfo.prototype.getParamsAsJSON = function() {
	if (this.paramsAsJSON) {
		return this.paramsAsJSON;
	}
	this.paramsAsJSON = {};
	var params = this.req.params();
	for ( var key in params) {
		this.paramsAsJSON[key] = params[key];
	}
	return this.paramsAsJSON;
};

RequestInfo.prototype.getBodyAsJSON = function(target, callback) {
	var body = new vertx.Buffer();
	this.req.dataHandler(function(buffer) {
		atmos.log('body buffer: ' + buffer);
		body.appendBuffer(buffer);
	});
	this.req.endHandler(function() {
		atmos.log('body: ' + body);
		var bodyJSON;
		if (body.length() > 0) {
			bodyJSON = JSON.parse(body);
		} else {
			bodyJSON = {};
		}
		callback.call(target, bodyJSON);
	});
};

RequestInfo.prototype.sendResponse = function(body, statusCode) {
	if (typeof (statusCode) != 'undefined' && statusCode != null) {
		this.req.response.statusCode = statusCode;
	}
	this.req.response.putAllHeaders({
		'Content-Type' : 'application/json; charset=UTF-8',
	});
	if (this.sessionId) {
		this.req.response.putHeader(this.headerNameSessionId, this.sessionId);
	}
	this.req.response.end(body);
};

//	createResponse : function(code, additionalMsg) {
//		var r = {};
//		r['code'] = code;
//		r['msg'] = CommonHandler.prototype.getErrorMsg(code);
//		r['remarks'] = additionalMsg;
//		return r;
//	},
//	getErrorMsg : function(code) {
//		if (code == CommonHandler.prototype.returnCodeArgumentMissingError) {
//			return CommonHandler.prototype.returnMessageArgumentMissingError;
//		} else if (code == CommonHandler.prototype.returnCodeArgumentInvalidFormatError) {
//			return CommonHandler.prototype.returnMessageArgumentInvalidFormatError;
//		} else {
//			return CommonHandler.prototype.returnMessageSystemError;
//		}
//	}
