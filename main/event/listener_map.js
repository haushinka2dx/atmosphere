var vertx = require('vertx');
load('main/event/listener_info.js');

function ListenerMap() {
	this.innerMap = {};
}
ListenerMap.prototype.constructor = ListenerMap;

ListenerMap.prototype.getAll = function() {
	return this.innerMap;
};

ListenerMap.prototype.getById = function(id) {
	return this.innerMap[id];
};

ListenerMap.prototype.getByUserIds = function(userIds) {
	if (!atmos.can(userIds) || userIds.length == 0) {
		return [];
	}

	return this.innerMap.filter(function(element, index, array) { return element.userId === userId; });
}

ListenerMap.prototype.add = function(listenerInfo) {
	if (!atmos.can(listenerInfo)) {
		// ignore
		return;
	}
	var alreadyExists = this.getById(listenerInfo.id);
	if (!alreadyExists) {
		this.innerMap[listenerInfo.id] = listenerInfo;
	}
	return;
};

ListenerMap.prototype.removeById = function(id) {
	if (!atmos.can(id)) {
		// ignore
		return;
	}
	var alreadyExists = this.getListenerById(id);
	if (alreadyExists) {
		delete this.innerMap[id];
	}
	return;
};

ListenerMap.prototype.remove = function(listenerInfo) {
	if (!atmos.can(listenerInfo)) {
		// ignore
		return;
	}
	this.removeById(listenerInfo.id);
};
