var vertx = require('vertx');

function ListenerInfo(sockJSSocket, userId, eventBusAddress) {
	this.sock = sockJSSocket;
	this.userId = userId;
	this.id = sockJSSocket.writeHandlerID;
	this.eventBusAddress = eventBusAddress;
	this.dataHandler = undefined;
}
ListenerInfo.prototype.constructor = ListenerInfo;

ListenerInfo.prototype.notify = function(msg) {
	var msgJSON = JSON.parse(msg);
	msgJSON['from_myself'] = msgJSON['from'] === this.userId;
	this.sock.write(new vertx.Buffer(JSON.stringify(msgJSON)));
}
