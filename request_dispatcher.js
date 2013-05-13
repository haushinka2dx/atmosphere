load('atmos_debug.js');
load('request_info.js');

///
/// dispatch HTTP Request handler
///
function dispatchRequestHandler(routeMatcher, pattern, method, target, handler, requiresAuth, logger) {
	var wrappedHandler = function(req) {
		if (typeof(logger) != 'undefined') {
			plog(logger, '[' + method + ']' + pattern + ' was started.');
			dump_request(logger, req);
		}
		
		// 最初にRequestのBodyを取得しておかないと後で取得できなくなるのでここで一度取得しておく
		var requestInfo = new RequestInfo(req);
		requestInfo.getBodyAsJSON(
			this,
			function(bodyJSON) {
				// login check
				if (requiresAuth) {
					requestInfo.getCurrentUserId(
						this,
						function(currentUserId) {
							if (currentUserId != null) {
								handler.call(target, requestInfo);
							}
							else {
								requestInfo.sendResponse('', 401);
							}
						}
					);
				}
				else {
					handler.call(target, requestInfo);
				}
			}
		);

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
		var targetAndHandler = patternHandlerMap[pattern];
		var target = targetAndHandler[0];
		var handler = targetAndHandler[1];
		var requiresAuth = targetAndHandler[2];
		dispatchRequestHandler(routeMatcher, pattern, method, target, handler, requiresAuth, logger);
	}
}
