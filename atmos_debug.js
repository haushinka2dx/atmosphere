load('time_format.js');

function plog(logger, msg) {
	var message = '[' + getCurrentTime() + '] ' + msg;
	logger.info(message);
	// logger.debug(message);
}

function dump_request(logger, req, enableHeaders, enableParameters, enableBody) {
	plog(logger, 'Http request has received. uri[' + req.uri + '] path[' + req.path + '] query[' + req.query + ']');
	if (enableHeaders) {
		plog(logger, '  Headers:');
		for ( var keyname in req.headers()) {
			plog(logger, '    ' + keyname + ': ' + req.headers()[keyname]);
		}
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
