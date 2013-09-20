var vertx = require('vertx');

function EventAction() {};
EventAction.prototype.constructor = EventAction;
EventAction.prototype.SendMessage

var EventAction = function() {
};
EventAction.prototype = {
	sendMessage : "sendMessage",
	removedMessage : "removedMessage",
	sendPrivate : "sendPrivate",
	removedPrivate : "removedPrivate",
	sendResponse : "sendResponse",
	listened : "listened",
	addGroupMember : "addGroupMember",
	removeGroupMember : "removeGroupMember",
	all : function() {
		return [ EventAction.prototype.sendMessage, EventAction.prototype.removedMessage, EventAction.prototype.sendPrivate, EventAction.removedPrivate, EventAction.prototype.sendResponse, EventAction.prototype.listened, EventAction.prototype.addGroupMember, EventAction.prototype.removeGroupMember ];
	},
	contains : function(action) {
		var all = EventAction.prototype.all();
		return all.indexOf(action) > -1
	},
}

function EventInfo(eventAction, processedInfo, fromUserId, addressesUsers) {
	this.action = eventAction;
	this.info = processedInfo;
	this.from = fromUserId;
	this.addressesUsers = addressesUsers;
};

EventInfo.prototype.constructor = EventInfo;

EventInfo.prototype.toJSON = function() {
	var j = {
		"action" : this.action,
		"info" : this.info,
		"from" : this.from,
	};
	return JSON.stringify(j);
}
