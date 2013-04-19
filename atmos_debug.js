function plog(logger, msg) {
	var message = '[' + getCurrentTime() + '] ' + msg;
	logger.info(message);
	//logger.debug(message);
}

//現在時刻取得（yyyy/mm/dd hh:mm:ss）
function getCurrentTime() {
	var now = new Date();
	var res = "" + now.getFullYear() + "/" + padZero(now.getMonth() + 1) + 
		"/" + padZero(now.getDate()) + " " + padZero(now.getHours()) + ":" + 
		padZero(now.getMinutes()) + ":" + padZero(now.getSeconds());
	return res;
}

//先頭ゼロ付加
function padZero(num) {
	var result;
	if (num < 10) {
		result = "0" + num;
	} else {
		result = "" + num;
	}
	return result;
}

function dump_request(logger, req, enableHeaders, enableParameters, enableBody) {
	plog(logger, 'Http request has received. uri[' + req.uri + '] path[' + req.path + '] query[' + req.query + ']');
	if (enableHeaders) {
		plog(logger, '  Headers:');
		for (var keyname in req.headers()) {
			plog(logger, '    ' + keyname + ': ' + req.headers()[keyname]);
		}
	}

	if (enableParameters) {
		plog(logger, '  Parameters:');
		for (var paramname in req.params()) {
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
