/* jshint camelcase: false, quotmark: false */
'use strict';
var Message = require('models/message');
var _ = require('underscore');
var strings = require('util/strings');

function findTimeline(req, res, query) {
	query.sort({created_at: 'desc'});
	if (req.query.count) {
		query.limit(req.query.count);
	}
	if (req.query.futureThan) {
		query.gt('created_at', req.query.futureThan);
	}
	if (req.query.pastThan) {
		query.lt('created_at', req.query.pastThan);
	}

	query.exec()
	.onFulfill(function(docs) {
		res.json({
			status: 'ok',
			count: _.size(docs),
			oldest_created_at: _.isEmpty(docs) ? '' : _.last(docs).created_at,
			latest_created_at: _.isEmpty(docs) ? '' : _.first(docs).created_at,
			results: docs
		});
	})
	.onReject(function(err) {
		res.json({status: 'ng', error: err});
	})
	.end();
}

// TODO pattern test
// Response: {"status":"ok","count":0,"results":[Message],
//            "oldest_created_at":"","latest_created_at":""}
exports.timeline = function(req, res) {
	findTimeline(req, res, Message.whereGlobalTimeline(req.user));
};

// TODO test
exports.focusedTimeline = function(req, res) {
	if (_.isEmpty(req.user.getSpeakers())) {
		res.json(400, {status: 'You listen nobody.'});
		return;
	}
	findTimeline(req, res, Message.whereFocusedTimeline(req.user));
};

// TODO test
exports.talkTimeline = function(req, res) {
	findTimeline(req, res, Message.whereTalkTimeline(req.user));
};

// TODO test
exports.announceTimeline = function(req, res) {
	findTimeline(req, res, Message.whereAnnounceTimeline(req.user));
};

// TODO test
exports.monologTimeline = function(req, res) {
	findTimeline(req, res, Message.whereMonologTimeline(req.user));
};

// TODO パターン色々
// TODO 複雑度高い
// TODO test
exports.search = function(req, res) {
	var query = Message.find();
	query.sort({created_at: 'desc'});
	var messageIds = strings.string2array(req.query.message_ids, ',');
	if (!_.isEmpty(messageIds)) {
		query.in('_id', messageIds);
	}
	if (req.query.reply_to_message_id) {
		query.where('reply_to', req.query.reply_to_message_id);
	}
	if (req.query.futureThan) {
		query.gt('created_at', req.query.futureThan);
	}
	if (req.query.created_by) {
		query.where('created_by', req.query.created_by);
	}
	if (req.query.count) {
		query.limit(req.query.count);
	}

	query.exec()
	.onFulfill(function(docs) {
		res.json({
			status: 'ok',
			count: _.size(docs),
			oldest_created_at: _.isEmpty(docs) ? '' : _.last(docs).created_at,
			latest_created_at: _.isEmpty(docs) ? '' : _.first(docs).created_at,
			results: docs
		});
	})
	.onReject(function(err) {
		res.json({status: 'ng', error: err});
	})
	.end();
};

// ポーティング前から未実装
exports.cancel = function(req, res) {
	res.json({status: 'not implements'});
};

// {"_id":"6cb2ea16-1641-4706-9124-a2eb83a6f1c2","status":"ok"}
exports.send = function(req, res) {
	var body = req.body;
	if (_.isEmpty(body.message)) {
		return res.json(400, {status: 'error', message: "'message' are must not be null."});
	}

	var promise = _.isEmpty(body.reply_to)
		? req.user.sendMessage(body.message, body.message_type)
		: req.user.replyMessage(body.message, body.message_type, body.reply_to);

	promise
		.onFulfill(function(msg) {
			res.json({status: 'ok', _id: msg._id});
			// TODO ここでやりたくない
			require('./websocket_pool').notifyMessage({
				action: 'sendMessage',
				info: msg,
				from: msg.created_by,
				from_myself: msg.created_by === req.user.username
			});
		})
		.onReject(function(err) {
			res.json({status: 'ng', error: err});
		})
		.end();
};

// {"number":1,"status":"ok"}
exports.destroy = function(req, res) {
	var body = req.body;
	if (_.isEmpty(body._id)) {
		return res.json(400, {status: 'error', message: "Destroy requires '_id'"});
	}

	req.user.removeMessage(body._id, function(err, msg) {
		console.log(err);
		if (err) {
			res.json(400, {status: 'error', message: err});
		} else {
			res.json({status: 'ok', number: 1});
			// TODO ここでやりたくない
			require('./websocket_pool').notifyMessage({
				action: 'removedMessage',
				info: msg,
				from: msg.created_by,
				from_myself: msg.created_by === req.user.username
			});
		}
	});
};

// TODO test
// TODO ほとんどModel側の処理では
// {"number":1,"status":"ok"}
exports.response = function(req, res) {
	var body = req.body;
	if (_.isEmpty(body.target_id)) {
		return res.json(400, {status: 'error', message: "'target_id' is must not be null."});
	}
	var action = body.action;
	if (_.isEmpty(action)) {
		return res.json(400, {status: 'error', message: "'action' is must not be null."});
	}

	var userId = req.user.username;
	Message.findOne({_id: body.target_id}).exec()
	.onFulfill(function(message) {
		if (_.isEmpty(message)) {
			res.json(404, {status: 'error', message: "'action' is must not be null."});
			return;
		}
		if (message.created_by === userId) {
			res.json(404, {status: 'error', message: 'You can not respond your own message.'});
			return;
		}
		// TODO これはModel側の制約
		if (message.responses[action].indexOf(userId) !== -1) {
			res.json(404, {status: 'error', message: 'You aleady responded.'});
		}

		message.responses[action].push(userId);
		message.save(function(err, msg) {
			if (err) {
				res.json({status: 'error', message: err});
				return;
			}
			res.json({number: 1, status: 'ok'});
			// TODO ここでやりたくない
			require('./websocket_pool').notifyResponse({
				action: 'sendResponse',
				info: msg,
				from: userId,
				from_myself: true // TODO trueしかないのでは
			}, action);
		});
	})
	.onReject(function(err) {
		res.json({status: 'ng', message: err});
	})
	.end();
};

// TODO test
// TODO responseと共通化
exports.removeResponse = function(req, res) {
	var body = req.body;
	if (_.isEmpty(body.target_id)) {
		return res.json(400, {status: 'error', message: "'target_id' is must not be null."});
	}
	var action = body.action;
	if (_.isEmpty(action)) {
		return res.json(400, {status: 'error', message: "'action' is must not be null."});
	}

	var userId = req.user.username;
	Message.findOne({_id: body.target_id}).exec()
	.onFulfill(function(message) {
		if (_.isEmpty(message)) {
			res.json(404, {status: 'error', message: "'action' is must not be null."});
			return;
		}
		if (message.created_by === userId) {
			res.json(404, {status: 'error', message: 'You can not respond your own message.'});
			return;
		}
		// TODO これはModel側の制約
		if (message.responses[action].indexOf(userId) === -1) {
			res.json(404, {status: 'error', message: 'You do not respond this message.'});
		}

		message.responses[action].pull(userId);
		message.save(function(err) {
			if (err) {
				res.json({status: 'error', message: err});
				return;
			}
			res.json({number: 1, status: 'ok'});
		});
	})
	.onReject(function(err) {
		res.json({status: 'ng', message: err});
	})
	.end();
};
