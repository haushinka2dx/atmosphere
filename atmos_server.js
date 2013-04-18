load('vertx.js');
load('constants.js');
load('atmos_debug.js');

var log = vertx.logger;
var server = vertx.createHttpServer();
var routeMatcher = new vertx.RouteMatcher();

routeMatcher.get(pMessagesTimeline, function(req) {
	log.debug('GET ' + pMessagesTimeline);
	log.info(pMessagesTimeline + ' was matched.');
	dump_request(log, req);
});

routeMatcher.noMatch(function(req) {
	log.debug('noMatch');
	dump_request(log, req);
	req.response.sendFile('json/common/404.json');
});

server.requestHandler(routeMatcher);

function write_to_response(req, data, encoding) {
	req.response.putHeader('Content-Length', data.length);
	req.response.write(data, encoding);
}

server.listen(9999, 'localhost');
