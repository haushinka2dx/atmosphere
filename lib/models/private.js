/* jshint camelcase: false */
'use strict';
var mongoose = require('mongoose');
var config = require('config');

var PrivateMessageSchema = new mongoose.Schema({
	to_user_id : {type: [String], required: true }, // TODO ref: user_id
}, { collection: 'private' });

PrivateMessageSchema.plugin(require('./plugins/base_schema'));
PrivateMessageSchema.plugin(require('./plugins/base_message'));

PrivateMessageSchema.statics.newMessage = function(toUserIds, text, createdBy) {
	var M = mongoose.model('PrivateMessage');
	return {
		message: text,
		to_user_id: toUserIds,
		created_by: createdBy,
		hashtags: M.extractHashtags(text),
	};
};

// TODO message側と共通化
function referenceDateTime() {
	// TODO moment?
	return new Date(Date.now() - (config.message.publishDelaySeconds * 1000));
}

PrivateMessageSchema.statics.whereTimeline = function(user) {
	return this.find(
			{$or: [
				// 自分が発信したもの
				{created_by: user.username},
				{$and: [
					// 他人が発信した
					{created_by: {$ne: user.username}},
					// pushlishDelaySeconds の時間が経過した
					{created_at: {$lt: referenceDateTime()}},
					// 宛先に自分が含まれている
					{to_user_id: {$in: [user.username]}}
				]}
			]});
};

module.exports = mongoose.model('PrivateMessage', PrivateMessageSchema);
