/* jshint camelcase: false, quotmark: false */
'use strict';
var mongoose = require('mongoose');
var config = require('config');
var Message = require('models/message');
var PrivateMessage = require('models/private');
require('models/group');
var _ = require('underscore');

var UserSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	avator: { type: String, required: true, default: config.assets.defaultAvatorUrl },
	introduction: { type: String, default: '' },
	groups: { type: [String], default: [] },
	relationship : {
		listen : {type: [String], default: [] },
	},
});

UserSchema.plugin(require('./plugins/base_schema'));
UserSchema.plugin(require('./plugins/auth'));
UserSchema.plugin(require('./plugins/transform'), {
	transform: function(doc, ret) {
		return {
			user_id: ret.username,
			avator: ret.avator,
			introduction: ret.introduction,
			groups: ret.groups,
			relationship: ret.relationship,
		};
	}
});

function createBase(name, password, createdBy) {
	return {
		username: name,
		password: password,
		created_by: createdBy,
	};
}

function adminGroupIds() {
	return mongoose.model('Group').adminIds;
}

UserSchema.statics.regist = function(name, password, createdBy, callback) {
	var promise = this.create(createBase(name, password, createdBy));
	if(callback) {
		return promise.then(callback).end();
	}
	return promise;
};

UserSchema.statics.registAdmin = function(name, password, createdBy, callback) {
	var base = createBase(name, password, createdBy);
	base.groups = adminGroupIds();
	var promise = this.create(base);

	if(callback) {
		return promise.then(callback).end();
	}
	return promise;
};

UserSchema.statics.findByUserId = function(userId, callback) {
	return this.findOne({username: userId}, callback);
};

UserSchema.statics.findByUserIds = function(userIds, callback) {
	var sort = {sort: {username: 1 }};
	return this.find({username: {$in: userIds}}, null, sort, callback);
};

UserSchema.statics.findByGroupIds = function(groupIds, callback) {
	var sort = {sort: {username: 1 }};
	return this.find({groups: {$in: groupIds}}, null, sort, callback);
};

// TODO test
UserSchema.statics.findByListeners = function(userId, callback) {
	return this.find({'relationship.listen': {$in: [userId]}}, callback);
};


UserSchema.methods.hasAdministratorPrivilege = function() {
	return 0 < _.intersection(this.groups, adminGroupIds()).length;
};

UserSchema.methods.addGroup = function(userId, groupId) {
	if(!this.hasAdministratorPrivilege()) {
		throw 'You have no privilege to manipulate the system group.';
	}

	var _User = mongoose.model('User');
	return mongoose.model('Group')
		.findByGroupId(groupId).exec()
		.then(function(group) {
			if (_.isEmpty(group)) {
				throw "There is no group which id is '" + groupId + "'.";
			}
		})
		.then(function() {
			return _User.findByUserId(userId).exec();
		})
		.then(function(toUser) {
			if (_.isEmpty(toUser)) {
				throw "Not found user '" + userId + "'.";
			}
			var groups = toUser.groups;
			groups.push(groupId);
			// toUser.save()ではpromiseを返せないので仕方なくfind
			return _User.findOneAndUpdate({_id: toUser._id}, {groups: groups}).exec();
		});
};

UserSchema.methods.leaveGroup = function(userId, groupId) {
	if(!this.hasAdministratorPrivilege()) {
		throw 'You have no privilege to manipulate the system group.';
	}

	var _User = mongoose.model('User');
	return mongoose.model('Group')
		.findByGroupId(groupId).exec()
		.then(function(group) {
			if (_.isEmpty(group)) {
				throw "There is no group which id is '" + groupId + "'.";
			}
		})
		.then(function() {
			return _User.findByUserId(userId).exec();
		})
		.then(function(toUser) {
			if (_.isEmpty(toUser)) {
				throw "Not found user '" + userId + "'.";
			}
			var groups = _.without(toUser.groups, groupId);
			// toUser.save()ではpromiseを返せないので仕方なくfind
			return _User.findOneAndUpdate({_id: toUser._id}, {groups: groups}).exec();
		});
};

// TODO type test
UserSchema.methods.sendMessage = function(message, messageType) {
	return Message.create(Message.newAutoDetect(message, this.username, messageType));
};

// TODO test
UserSchema.methods.sendPrivateMessage = function(toUserIds, message) {
	return PrivateMessage.create(PrivateMessage.newMessage(toUserIds, message, this.username));
};

// TODO test
UserSchema.methods.replyMessage = function(message, messageType, replyTo) {
	var m = Message.newAutoDetect(message, this.username, messageType);
	m.reply_to = replyTo;
	return Message.create(m);
};

// TODO test
UserSchema.methods.replyPrivateMessage = function(toUserIds, message, replyTo) {
	var m = PrivateMessage.newMessage(toUserIds, message, this.username);
	m.reply_to = replyTo;
	return PrivateMessage.create(m);
};

// TODO test
// TODO callbackが使われるタイミング分かりにくい(読みにくい)
UserSchema.methods.removeMessage = function(id, callback) {
	var myname = this.username;
	return Message
		.findOne({_id: id}).exec()
		.then(function(message) {
			if (_.isEmpty(message)) {
				throw 'The message to be destroyed was not found.';
			}
			if (message.created_by !== myname) {
				throw 'The message to be destroyed was not your message.';
			}
			return message;
		})
		.then(function(message) {
			return Message.findOneAndRemove({_id: message._id}, callback);
		})
		.onReject(function(err) {
			callback(err);
		})
		.end();
};

// TODO test
UserSchema.methods.removePrivateMessage = function(id, callback) {
	var myname = this.username;
	return PrivateMessage
		.findOne({_id: id}).exec()
		.then(function(message) {
			if (_.isEmpty(message)) {
				throw 'The message to be destroyed was not found.';
			}
			if (message.created_by !== myname) {
				throw 'The message to be destroyed was not your message.';
			}
			return message;
		})
		.then(function(message) {
			return PrivateMessage.findOneAndRemove({_id: message._id}, callback);
		})
		.end();
};

// TODO test
UserSchema.methods.getMembers = function(groupId) {
	var userId = this.username;
	return mongoose.model('Group')
		.findOne({group_id: groupId})
		.then(function(group) {
			return group.getMembers(userId);
		})
		.end();
};

// TODO これ意味なくね(カプセル化するにしてもpath()を使えばいいので)
UserSchema.methods.getGroups = function() {
	return this.groups;
};

// TODO test
UserSchema.methods.createGroup = function(groupId, type, name, explain) {
	var Group = mongoose.model('Group');
	var record = Group.newRecord(groupId, type, this.username);
	record.group_name = name;
	record.group_explanation = explain;
	return Group.create(record);
};

UserSchema.methods.removeGroup = function(groupId) {
	var userId = this.username;
	return mongoose.model('Group')
		.findOne({group_id: groupId})
		.then(function(group) {
			return group.destroy(userId);
		})
		.end();
};

// TODO test
UserSchema.methods.getSpeakers = function() {
	return this.relationship.listen;
};

// TODO promise返したいが...
UserSchema.methods.addSpeaker = function(userId) {
	this.relationships.listeners.push(userId);
	this.save();
};

// TODO promise返したいが...
UserSchema.methods.removeSpeaker = function(userId) {
	var updated = _.withou(this.relationships.listeners, userId);
	this.relationships.listeners = updated;
	this.save();
};

module.exports = mongoose.model('User', UserSchema);
