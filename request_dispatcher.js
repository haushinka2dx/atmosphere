load('atmos_debug.js');

///
/// dispatch HTTP Request handler
///
function dispatchRequestHandler(routeMatcher, pattern, method, handler, logger) {
	var wrappedHandler = function(req) {
		if (typeof(logger) != 'undefined') {
			plog(logger, '[' + method + ']' + pattern + ' was started.');
			dump_request(logger, req);
		}
		handler(req);
		if (typeof(logger) != 'undefined') {
			plog(logger, '[' + method + ']' + pattern + ' was finished.');
		}
	};
	if (method == 'GET') {
		routeMatcher.get(pattern, wrappedHandler);
	}
	else if (method == 'POST') {
		routeMatcher.post(pattern, wrappedHandler);
	}
	if (typeof(logger) != 'undefined') {
		plog(logger, 'Registered route pattern [' + method + '] ' + pattern);
	}
}

///
/// dispatch HTTP Request Handlers
///
function dispatchRequestHandlers(routeMatcher, method, patternHandlerMap, logger) {
	for (var pattern in patternHandlerMap) {
		var handler = patternHandlerMap[pattern];
		dispatchRequestHandler(routeMatcher, pattern, method, handler, logger);
	}
}
