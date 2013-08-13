load('main/util/time_format.js');

function plog(logger, msg) {
	if (typeof(logger) != 'undefined' && logger != null) {
		var message = '[' + getCurrentTime() + '] ' + msg;
		logger.info(message);
		// logger.debug(message);
	}
}

function dump_request(logger, req, enableHeaders, enableParameters, enableBody) {
	plog(logger, 'Http request has received. method[' + req.method() + '] uri[' + req.uri() + '] path[' + req.path() + '] query[' + req.query() + ']');
	if (enableHeaders) {
		plog(logger, '  Headers:');
		req.headers().forEach(function(keyname, value) {
			plog(logger, '    ' + keyname + ': ' + value);
		});
	}

	if (enableParameters) {
		plog(logger, '  Parameters:');
		for ( var paramname in req.params()) {
			plog(logger, '    ' + paramname + ': ' + req.params()[paramname]);
		}
	}

	if (enableBody) {
		var body = new vertx.Buffer();
		req.dataHandler(function(buf) {
			body.appendBuffer(buf);
		});
		req.endHandler(function() {
			plog(logger, 'The total body received was ' + body.length() + ' bytes.');
		});
	}
}
