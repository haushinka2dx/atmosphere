load('main/util/atmos_debug.js');
load('main/net/http/request_info.js');

///
/// dispatch HTTP Request handler
///
function dispatchRequestHandler(routeMatcher, pattern, method, handlerInfo, requiresAuth, logger) {
	var wrappedHandler = function(req) {
		if (typeof(logger) != 'undefined') {
			plog(logger, '[' + method + ']' + pattern + ' was started.');
			dump_request(logger, req);
		}
		
		// 最初にRequestのBodyを取得しておかないと後で取得できなくなるのでここで一度取得しておく
		var requestInfo = new RequestInfo(req);
		var getBodyAsJSONCallback = atmos.createCallback(
			function(bodyJSON) {
				// login check
				if (requiresAuth) {
					var getCurrentUserIdCallback = atmos.createCallback(
						function(currentUserId) {
							if (currentUserId != null) {
								handlerInfo.fire(requestInfo);
							}
							else {
								requestInfo.sendResponse('', 401);
							}
						},
						this
					);
					requestInfo.getCurrentUserId(
						getCurrentUserIdCallback
					);
				}
				else {
					handlerInfo.fire(requestInfo);
				}
			},
			this
		);
		requestInfo.getBodyAsJSON(
			getBodyAsJSONCallback
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
