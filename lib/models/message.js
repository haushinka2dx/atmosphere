/* jshint camelcase: false */
'use strict';
var mongoose = require('mongoose');
var config = require('config');
var _ = require('underscore');

var typeMessage = 'message';
var typeAnnounce = 'announce';
var typeAnnouncePlus = 'announce_plus';
var typeMonolog = 'monolog';

var MessageSchema = new mongoose.Schema({
	message_type : {
		type: String, required: true,
		enum: [typeMessage, typeAnnounce, typeAnnouncePlus, typeMonolog]
	},
	addresses : {
		users : {type: [String], default: [] },
		groups : {type: [String], default: [] }
	},
});

MessageSchema.plugin(require('./plugins/base_schema'));
MessageSchema.plugin(require('./plugins/base_message'));

function newMessageObject(text, type, createdBy) {
	// staticメソッドを呼ぶために必要
	// ここではMessageSchema.xxと直接書けないので
	var M = mongoose.model('Message');
	return {
		message: text,
		message_type: type,
		created_by: createdBy,
		addresses: {
			users: M.extractAddressesUsers(text),
			groups: M.extractAddressesGroups(text)
		},
		hashtags: M.extractHashtags(text),
	};
}

MessageSchema.statics.newNormal = function(text, createdBy) {
	return new this(newMessageObject(text, typeMessage, createdBy));
};

MessageSchema.statics.newAnnounce = function(text, createdBy) {
	return new this(newMessageObject(text, typeAnnounce, createdBy));
};

MessageSchema.statics.newAnnouncePlus = function(text, createdBy) {
	return new this(newMessageObject(text, typeAnnouncePlus, createdBy));
};

MessageSchema.statics.newMonolog = function(text, createdBy) {
	return new this(newMessageObject(text, typeMonolog, createdBy));
};

// TODO test
// TODO 名前が微妙
MessageSchema.statics.newAutoDetect = function(text, createdBy, initType) {
	var message = new this(newMessageObject(text, initType, createdBy));
	if (initType === typeMonolog) {
		return message;
	}
	if (_.isEmpty(message.addresses.groups)) {
		message.message_type = typeMessage;
		return message;
	}
	if (_.isEmpty(message.addresses.users)) {
		message.message_type = typeAnnounce;
		return message;
	}
	message.message_type = typeAnnouncePlus;
	return message;
};


function referenceDateTime() {
	// TODO moment?
	return new Date(Date.now() - (config.message.publishDelaySeconds * 1000));
}

// TODO test
// TODO 複雑度が高い
MessageSchema.statics.whereGlobalTimeline = function(user) {
	return this.find(
			{$or: [
				// 自分が発信したもの
				{created_by: user.username},
				{$and: [
					// 他人が発信した
					{created_by: {$ne: user.username}},
					// pushlishDelaySeconds の時間が経過した
					{created_at: {$lt: referenceDateTime()}},
					{$or: [
						// message -> 制限なし
						{message_type: typeMessage},
						// announce -> 自分が所属しているグループが宛先になっているもの
						{$and: [
							{message_type: typeAnnounce},
							{'addresses.groups': {$in: user.groups}}
						]},
						// announce_plus -> 自分が所属しているグループが宛先になっているもの || 自分が宛先に含まれている
						{$and: [
							{message_type: typeAnnouncePlus},
							{$or: [
								{'addresses.groups': {$in: user.groups}},
								{'addresses.users': {$in: [user.username]}}
							]}
						]},
						// monolog -> 自分が発信したものに含まれるので特に指定なし
					]},
				]}
			]});
};

// TODO test
// TODO 複雑度が高い
MessageSchema.statics.whereTalkTimeline = function(user) {
	return this.find(
			{$and: [
				{message_type: {$in: [typeMessage, typeAnnouncePlus]}},
				{$or: [
					// 自分が発信したもの
					{created_by: user.username},
					{$and: [
						// 他人が発信した
						{created_by: {$ne: user.username}},
						// pushlishDelaySeconds の時間が経過した
						{created_at: {$lt: referenceDateTime()}},
						{$or: [
							// message -> 制限なし
							// TODO 上でmessage_type指定しているのでここは不要そう
							{message_type: typeMessage},
							// announce -> 自分が所属しているグループが宛先になっているもの
							{$and: [
								{message_type: typeAnnounce},
								{'addresses.groups': {$in: user.groups}}
							]},
							// announce_plus -> 自分が所属しているグループが宛先になっているもの || 自分が宛先に含まれている
							// TODO 上でmessage_type指定しているのでここは不要そう
							{$and: [
								{message_type: typeAnnouncePlus},
								{$or: [
									{'addresses.groups': {$in: user.groups}},
									{'addresses.users': {$in: [user.username]}}
								]}
							]},
							// monolog -> 自分が発信したものに含まれるので特に指定なし
						]},
					]}
				]},
				{$or: [
					{created_by: user.username},
					{'addresses.users': {$in: [user.username]}}
				]}
			]});
};

// TODO test
// TODO 複雑度が高い
MessageSchema.statics.whereFocusedTimeline = function(user) {
	return this.find(
			{$and: [
				{message_type: {$in: [typeMessage, typeAnnounce, typeAnnouncePlus]}},
				{$or: [
					// 自分が発信したもの
					{created_by: user.username},
					{$and: [
						// 他人が発信した
						{created_by: {$ne: user.username}},
						// pushlishDelaySeconds の時間が経過した
						{created_at: {$lt: referenceDateTime()}},
						{$or: [
							// message -> 制限なし
							// TODO 上でmessage_type指定しているのでここは不要そう
							{message_type: typeMessage},
							// announce -> 自分が所属しているグループが宛先になっているもの
							{$and: [
								{message_type: typeAnnounce},
								{'addresses.groups': {$in: user.groups}}
							]},
							// announce_plus -> 自分が所属しているグループが宛先になっているもの || 自分が宛先に含まれている
							// TODO 上でmessage_type指定しているのでここは不要そう
							{$and: [
								{message_type: typeAnnouncePlus},
								{$or: [
									{'addresses.groups': {$in: user.groups}},
									{'addresses.users': {$in: [user.username]}}
								]}
							]},
							// monolog -> 自分が発信したものに含まれるので特に指定なし
						]},
					]}
				]},
				{created_by: {$in: user.getSpeakers()}},
			]});
};

// TODO test
// TODO 複雑度が高い
MessageSchema.statics.whereAnnounceTimeline = function(user) {
	var condition = {created_by: user.username};
	if (!_.isEmpty(user.groups)) {
		condition = {$or: [
			condition,
			{'addresses.groups': {$in: user.groups}}
		]};
	}
	return this.find(
			{$and: [
				{message_type: {$in: [typeAnnounce, typeAnnouncePlus]}},
				{$or: [
					// 自分が発信したもの
					{created_by: user.username},
					{$and: [
						// 他人が発信した
						{created_by: {$ne: user.username}},
						// pushlishDelaySeconds の時間が経過した
						{created_at: {$lt: referenceDateTime()}},
						{$or: [
							// message -> 制限なし
							// TODO 上でmessage_type指定しているのでここは不要そう
							{message_type: typeMessage},
							// announce -> 自分が所属しているグループが宛先になっているもの
							{$and: [
								{message_type: typeAnnounce},
								{'addresses.groups': {$in: user.groups}}
							]},
							// announce_plus -> 自分が所属しているグループが宛先になっているもの || 自分が宛先に含まれている
							// TODO 上でmessage_type指定しているのでここは不要そう
							{$and: [
								{message_type: typeAnnouncePlus},
								{$or: [
									{'addresses.groups': {$in: user.groups}},
									{'addresses.users': {$in: [user.username]}}
								]}
							]},
							// monolog -> 自分が発信したものに含まれるので特に指定なし
						]},
					]}
				]},
				condition,
			]});
};

// TODO test
// TODO 複雑度が高い
MessageSchema.statics.whereMonologTimeline = function(user) {
	return this.find(
			{$and: [
				{message_type: {$in: [typeMonolog]}},
				{created_by: user.username},
				// TODO monologでここいるのかな
				{$or: [
					// 自分が発信したもの
					{created_by: user.username},
					{$and: [
						// 他人が発信した
						{created_by: {$ne: user.username}},
						// pushlishDelaySeconds の時間が経過した
						{created_at: {$lt: referenceDateTime()}},
						{$or: [
							// message -> 制限なし
							// TODO 上でmessage_type指定しているのでここは不要そう
							{message_type: typeMessage},
							// announce -> 自分が所属しているグループが宛先になっているもの
							{$and: [
								{message_type: typeAnnounce},
								{'addresses.groups': {$in: user.groups}}
							]},
							// announce_plus -> 自分が所属しているグループが宛先になっているもの || 自分が宛先に含まれている
							// TODO 上でmessage_type指定しているのでここは不要そう
							{$and: [
								{message_type: typeAnnouncePlus},
								{$or: [
									{'addresses.groups': {$in: user.groups}},
									{'addresses.users': {$in: [user.username]}}
								]}
							]},
							// monolog -> 自分が発信したものに含まれるので特に指定なし
						]},
					]}
				]},
			]});
};

// TODO test
MessageSchema.statics.whereRecent = function() {
	return this
					.where('messageType', typeMessage)
					.where('created_at').lt(referenceDateTime());
};

module.exports = mongoose.model('Message', MessageSchema);
