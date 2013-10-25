load('main/core/constants.js');
load('main/event/listener_info.js');
load('main/event/listener_map.js');

var NotificationManager = function() {
	this.listeners = new ListenerMap();
};
NotificationManager.prototype = {

	addressPublishPrefix : 'atmos.notice.publish',

	addressPublishAll : function() {
		return this.genEventBusAddress('allusers');
	},

	genEventBusAddress : function(userId) {
		return this.addressPublishPrefix + '.' + userId;
	},

	eb : function() {
		var eb = vertx.eventBus;
		return eb;
	},

	notify : function(eventInfo) {
		var manager = this;
		var targetAddresses = [];
		if (!atmos.canl(eventInfo.addressesUsers)) {
			targetAddresses.push(manager.addressPublishAll());
		}
		else {
			targetAddresses.push(manager.genEventBusAddress(eventInfo.from));
			eventInfo.addressesUsers.forEach(function(userId, index, array) {
				targetAddresses.push(manager.genEventBusAddress(userId));
			});
			targetAddresses = atmos.uniqueArray(targetAddresses);
		}
		atmos.varDump(targetAddresses);
		targetAddresses.forEach(function(address, index, array) {
			manager.eb().publish(address, eventInfo.toJSON());
		});
	},

	addListener : function(sock, userId) {
		var li = new ListenerInfo(sock, userId, this.genEventBusAddress(userId));
		var dataHandler = (function() {
			var target = li;
			return function(msg) {
				target.notify(msg);
			};
		})();
		this.eb().registerHandler(li.eventBusAddress, dataHandler);
		this.eb().registerHandler(this.addressPublishAll(), dataHandler);
		li.dataHandler = dataHandler;
		this.listeners.add(li);
		atmos.log("listener added: id[" + li.id + "] userId[" + li.userId + "]");
	},

	removeListener : function(sock) {
		var li = this.getListener(sock.writeHandlerID);
		this.eb().unregisterHandler(this.addressPublishAll(), li.dataHandler);
		this.eb().unregisterHandler(li.eventBusAddress, li.dataHandler);
		this.listeners.remove(li);
	},

	getListener : function(id) {
		return this.listeners.getById(id);
	}
};

function getNotificationManager() {
	var u = new NotificationManager();
	return u;
}
