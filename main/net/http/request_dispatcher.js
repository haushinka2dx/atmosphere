load('main/util/atmos_debug.js');
load('main/net/http/request_info.js');

///
/// dispatch HTTP Request handler
///
function dispatchRequestHandler(routeMatcher, pattern, method, handlerInfo, requiresAuth, multipart, logger) {
	var wrappedHandler = function(req) {
		if (typeof(logger) != 'undefined') {
			plog(logger, '[' + method + ']' + pattern + ' was started.');
			dump_request(logger, req);
		}
		
		var requestInfo = new RequestInfo(req, multipart);
		if (method == 'POST') {
			requestInfo.pauseRequest();
		}
		// login check
		if (requiresAuth) {
			var getCurrentUserIdCallback = atmos.createCallback(
				function(currentUserId) {
					atmos.log('curentUserId on dispatchRequestHandler: ' + currentUserId);
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
		var multipart = targetAndHandler[3];
		dispatchRequestHandler(routeMatcher, pattern, method, target, handler, requiresAuth, multipart, logger);
	}
}
