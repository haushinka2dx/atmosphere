function dump_request(logger, req, enableHeaders, enableParameters, enableBody) {
	logger.info('Http request has received. uri[' + req.uri + '] path[' + req.path + '] query[' + req.query + ']');
	if (enableHeaders) {
	logger.info('  Headers:');
	for (var keyname in req.headers()) {
		logger.info('    ' + keyname + ': ' + req.headers()[keyname]);
	}
	}

	if (enableParameters) {
	logger.info('  Parameters:');
	for (var paramname in req.params()) {
		logger.info('    ' + paramname + ': ' + req.params()[paramname]);
	}
	}

	if (enableBody) {
	var body = new vertx.Buffer();
	req.dataHandler(function(buf) {
		body.appendBuffer(buf);
	});
	req.endHandler(function() {
		logger.info('The total body received was ' + body.length() + ' bytes.');
	});
	}
}
