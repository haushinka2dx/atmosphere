var vertx = require('vertx');
load('main/core/constants.js');

function RequestInfo(req, multipart) {
	this.req = req;
	this.query = req.query;
	this.headers = req.headers();
	this.readyCookie();
	this.isMultipart = multipart;
}

RequestInfo.prototype.constructor = RequestInfo;

RequestInfo.prototype.headerNameSessionId = getConstants().headerNameSessionId;

RequestInfo.prototype.getHeaderValue = function(name) {
	var headerValue = null;
	this.headers.forEach(function(key, value) {
		if (key.toLowerCase() === name.toLowerCase()) {
			headerValue = value;
			return;
		}
	});
	return headerValue;
};

RequestInfo.prototype.readyCookie = function() {
	if (!atmos.can(this.cookies)) {
		this.cookies = {};
		var rawCookie = ' ' + this.getHeaderValue('Cookie') + ' ';
		var p = /([^; =]+)=([^; =]+)/g;
		while (keyvalue = p.exec(rawCookie)) {
			var cookieKey = keyvalue[1];
			var cookieValue = keyvalue[2];
			this.cookies[cookieKey] = cookieValue;
		}
	}
};

RequestInfo.prototype.getCookieValue = function(name) {
	this.readyCookie();

	if (Object.keys(this.cookies).indexOf(name) > -1) {
		return this.cookies[name];
	}
	else {
		return null;
	}
};

RequestInfo.prototype.setCookieValue = function(name, value) {
	if (atmos.can(name) && atmos.can(value)) {
		this.readyCookie();
		this.cookies[name] = value;
	}
};

RequestInfo.prototype.getSessionId = function(callbackInfo) {
	atmos.log('req.sessionId 01: ' + this.sessionId);
	if (!atmos.can(this.sessionId)) {
		this.setSessionId(this.getHeaderValue(this.headerNameSessionId));
		atmos.log('req.sessionId 02: ' + this.sessionId);
		if (atmos.can(this.sessionId)) {
			callbackInfo.fire(this.sessionId);
		}
		else {
			this.setSessionId(this.getCookieValue(this.headerNameSessionId));
			atmos.log('req.sessionId 03: ' + this.sessionId);
			if (atmos.can(this.sessionId)) {
				callbackInfo.fire(this.sessionId);
			}
			else if (this.isMultipart) {
				var readyBodyMultipartCallback = atmos.createCallback(
					function() {
						var getBodyAsJSONCallback = atmos.createCallback(
							function(bodyJSON) {
								atmos.log('bodyJSON on getSessionId: ' + JSON.stringify(bodyJSON));
								var sessionId = bodyJSON[this.headerNameSessionId];
								atmos.log('req.sessionId 04: ' + sessionId);
								if (atmos.can(sessionId)) {
									this.setSessionId(sessionId);
									callbackInfo.fire(this.sessionId);
								}
								else {
									callbackInfo.fire(null);
								}
							},
							this
						);
						this.getBodyAsJSON(
							getBodyAsJSONCallback
						);
					},
					this
				);
				this.readyBodyMultipart(
					readyBodyMultipartCallback
				);
			}
			else {
				callbackInfo.fire(null);
			}
		}
	}
	else {
		callbackInfo.fire(this.sessionId);
	}
};

RequestInfo.prototype.setSessionId = function(sessionId) {
	this.sessionId = sessionId;
	this.setCookieValue(this.headerNameSessionId, sessionId);
};

RequestInfo.prototype.getCurrentUserId = function(callbackInfo) {
	if (this.currentUserId != null) {
		callbackInfo.fire(this.currentUserId);
	}
	else {
		var getSessionIdCallback = atmos.createCallback(
			function(sessionId) {
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
			},
			this
		);
		this.getSessionId(
			getSessionIdCallback
		);
	}
};

RequestInfo.prototype.pauseRequest = function() {
	this.req.pause();
	atmos.log('request paused.');
};

RequestInfo.prototype.resumeRequest = function() {
	this.req.resume();
	atmos.log('request resumed.');
};

RequestInfo.prototype.getQueryValue = function(name) {
	var queryJSON = this.getQueryAsJSON();
	return queryJSON[name];
};

RequestInfo.prototype.getQueryAsJSON = function() {
	if (this.queryAsJSON) {
		return this.queryAsJSON;
	}
	atmos.log('query string: ' + this.req.query());
	this.queryAsJSON = {};
	var p1 = /[^&]+/g;
	var keyValue;
	while (keyValue = p1.exec(this.req.query())) {
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
		var readyBodyCallback = atmos.createCallback(
			function() {
				callbackInfo.fire(this.bodyJSON);
			},
			this
		);
		this.readyBody(readyBodyCallback);
	}
};

RequestInfo.prototype.getBody = function(callbackInfo) {
	if (this.bodyRaw != null) {
		callbackInfo.fire(this.bodyRaw);
	}
	else {
		var readyBodyCallback = atmos.createCallback(
			function() {
				callbackInfo.fire(this.bodyRaw);
			},
			this
		);
		this.readyBody(readyBodyCallback);
	}
};

RequestInfo.prototype.readyBody = function(bodyIsReadyCallbackInfo) {
	if (this.bodyJSON == null && this.bodyRaw == null) {
		var body = new vertx.Buffer();
		var reqInfo = this;
		this.req.dataHandler(function(buffer) {
			var inner = function(buffer) {
				body.appendBuffer(buffer);
			};
			inner.call(reqInfo, buffer);
		});
		this.req.endHandler(function() {
			var inner = function() {
				atmos.log('body: ' + body);
				var bodyJSON;
				if (body.length() > 0) {
					try {
						bodyJSON = JSON.parse(body);
					}
					catch (e) {
						bodyJSON = {};
					}
				} else {
					bodyJSON = {};
				}
				this.bodyJSON = bodyJSON;
				this.bodyRaw = body;
				bodyIsReadyCallbackInfo.fire();
			};
			inner.call(reqInfo);
		});
		this.resumeRequest();
	}
	else {
		bodyIsReadyCallbackInfo.fire();
	}
};

RequestInfo.prototype.readyBodyMultipart = function(callbackInfo) {
	atmos.log('readyBodyMultipart started.');
	if (atmos.can(this.uploadedFiles)) {
		callbackInfo.fire();
	}
	else {
		var reqInfo = this;
		reqInfo.uploadedFiles = {};
		this.req.uploadHandler(function(upload) {
			var fileParts = upload.filename().split('.');
			var extension = fileParts.length > 0 ? fileParts[fileParts.length - 1] : null;
			var temporaryFilePath = atmos.createTemporaryFilePath(extension);
			upload.streamToFileSystem(temporaryFilePath);
			var uploadedInfo = { name : upload.name(), filename : upload.filename(), contentType : upload.contentType(), contentTransferEncoding : upload.contentTransferEncoding(), charset : upload.charset(), size : upload.size(), dataPath : temporaryFilePath };
			reqInfo.uploadedFiles[uploadedInfo.name] = uploadedInfo;
		});
		this.req.endHandler(function() {
			atmos.log('multipart endHandler called.');
			var dummyBodyJSON = {};
			var attributes = reqInfo.req.formAttributes();
			attributes.forEach(function(key, value) {
				dummyBodyJSON[key] = value;
			});
			reqInfo.bodyJSON = dummyBodyJSON;
			reqInfo.bodyRaw = JSON.stringify(dummyBodyJSON);
			callbackInfo.fire();
		});
		this.req.expectMultiPart(true);
		this.resumeRequest();
	}
};

RequestInfo.prototype.getUploadedFiles = function(callbackInfo) {
	atmos.log('getUploaderFile started.');
	if (atmos.can(this.uploadedFiles)) {
		callbackInfo.fire(this.uploadedFiles);
	}
	else {
		var readyBodyMultipartCallback = atmos.createCallback(
			function() {
				callbackInfo.fire(this.uploadedFiles);
			},
			this
		);
		this.readyBodyMultipart(
			readyBodyMultipartCallback
		);
	}
}

RequestInfo.prototype.sendResponse = function(body, statusCode) {
	var that = this;
	if (typeof (statusCode) != 'undefined' && statusCode != null) {
		this.req.response.statusCode(statusCode);
	}
	else {
		statusCode = 200;
	}

	// set response header
	this.req.response.putHeader('Content-Type', 'application/json; charset=UTF-8')
					.putHeader('Access-Control-Allow-Origin', '*');
	if (this.sessionId) {
		this.req.response.putHeader(this.headerNameSessionId, this.sessionId);
	}
	// set cookies
	if (atmos.can(this.cookies)) {
		var cookieList = [];
		Object.keys(this.cookies).forEach(function(key, i, a) {
			cookieList.push(key + '=' + that.cookies[key] + '; path=/;');
		});
		if (cookieList.length > 0) {
			that.req.response.putHeader('Set-Cookie', cookieList);
		}
	}
	if (statusCode == 200) {
		this.req.response.end(body);
	}
	else {
		this.req.response.statusMessage(body);
		this.req.response.end();
	}
};

RequestInfo.prototype.sendFile = function(filePath) {
	this.req.response.putHeader('Access-Control-Allow-Origin', '*');
	this.req.response.sendFile(filePath);
};
