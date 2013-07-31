var vertx = require('vertx');
load('main/core/constants.js');

function RequestInfo(req) {
	this.req = req;
	this.query = req.query;
}
RequestInfo.prototype.constructor = RequestInfo;

RequestInfo.prototype.headerNameSessionId = getConstants().headerNameSessionId;

RequestInfo.prototype.getSessionId = function() {
	if (!atmos.can(this.sessionId)) {
		var that = this;
		this.req.headers().forEach(function(key, value) {
			if (key === that.headerNameSessionId) {
				that.sessionId = value;
				return;
			}
		});
	}
	return this.sessionId;
};

RequestInfo.prototype.getCurrentUserId = function(callbackInfo) {
	if (this.currentUserId != null) {
		callbackInfo.fire(this.currentUserId);
	}
	else {
		var sessionId = this.getSessionId();
		if (atmos.can(sessionId)) {
			var getCurrentUserCallback = atmos.createCallback(
				function(userId) {
					if (userId != null) {
						this.currentUserId = userId;
					}
					callbackInfo.fire(userId);
				},
				this
			);
			atmos.auth.getCurrentUser(
				getCurrentUserCallback,
				sessionId
			);
		}
		else {
			callbackInfo.fire(null);
		}
	}
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
	var p1 = /[^&]+/g;
	var keyValue;
	while (keyValue = p1.exec(this.req.query)) {
		var p2 = /[^=]+/g;
		var kvpos = 0;
		var keyOrValue;
		var key;
		var value;
		while (keyOrValue = p2.exec(keyValue[0])) {
			if (kvpos === 0) {
				key = keyOrValue[0];
			}
			else if (kvpos === 1) {
				value = keyOrValue[0];
			}
			else {
				//ignore
			}
			kvpos++;
		}
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

RequestInfo.prototype.getBodyAsJSON = function(callbackInfo) {
	if (this.bodyJSON != null) {
		callbackInfo.fire(this.bodyJSON);
	}
	else {
		var body = new vertx.Buffer();
		var reqInfo = this;
		this.req.dataHandler(function(buffer) {
			var inner = function(buffer) {
				atmos.log('body buffer: ' + buffer);
				body.appendBuffer(buffer);
			};
			inner.call(reqInfo, buffer);
		});
		this.req.endHandler(function() {
			var inner = function() {
				atmos.log('body: ' + body);
				var bodyJSON;
				if (body.length() > 0) {
					bodyJSON = JSON.parse(body);
				} else {
					bodyJSON = {};
				}
				this.bodyJSON = bodyJSON;
				callbackInfo.fire(bodyJSON);
			};
			inner.call(reqInfo);
		});
	}
};

RequestInfo.prototype.sendResponse = function(body, statusCode) {
	if (typeof (statusCode) != 'undefined' && statusCode != null) {
		this.req.response.statusCode = statusCode;
	}
	this.req.response.putHeader('Content-Type', 'application/json; charset=UTF-8')
					.putHeader('Access-Control-Allow-Origin', '*');
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
