var vertx = require('vertx');

load('main/core/constants.js');

function ListenerInfo(sockJSSocket, userId, eventBusAddress) {
	this.sock = sockJSSocket;
	this.userId = userId;
	this.id = sockJSSocket.writeHandlerID;
	this.eventBusAddress = eventBusAddress;
	this.dataHandler = undefined;
	this.delayMilliseconds = getConstants().publishDelaySeconds * 1000;
}
ListenerInfo.prototype.constructor = ListenerInfo;

ListenerInfo.prototype.notify = function(msg) {
	var that = this;
	var msgJSON = JSON.parse(msg);
	msgJSON['from_myself'] = msgJSON['from'] === this.userId;
	if (msgJSON['from_myself']) {
		that.sock.write(new vertx.Buffer(JSON.stringify(msgJSON)));
	}
	else {
		vertx.setTimer(this.delayMilliseconds, function(timerId) {
			that.sock.write(new vertx.Buffer(JSON.stringify(msgJSON)));
		});
	}
}
