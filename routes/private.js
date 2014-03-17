/* jshint camelcase: false, quotmark: false */
'use strict';
var PrivateMessage = require('models/private');
var _ = require('underscore');
var strings = require('util/strings');

exports.timeline = function(req, res) {
	var query = PrivateMessage.whereTimeline(req.user);
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
};

// TODO message側と一緒
exports.search = function(req, res) {
	var query = PrivateMessage.find();
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

// {"_id":"6d54711c-1afe-46e9-ba1c-18505e98fb42","status":"ok"}
exports.send = function(req, res) {
	var body = req.body;
	if (_.isEmpty(body.to_user_id)) {
		return res.json(400, {status: 'error', message: "'to_user_id' is must not be null."});
	}
	if (_.isEmpty(body.message)) {
		return res.json(400, {status: 'error', message: "'message' is must not be null."});
	}

	// TODO ここでextractAddressesUsersを呼ぶのは微妙?
	var toUserIds = PrivateMessage.extractAddressesUsers(body.to_user_id);
	var promise = _.isEmpty(body.reply_to)
		? req.user.sendPrivateMessage(toUserIds, body.message)
		: req.user.replyPrivateMessage(toUserIds, body.message, body.reply_to);

	promise
		.onFulfill(function(msg) {
			res.json({status: 'ok', _id: msg._id});
			// TODO ここでやりたくない
			require('./websocket_pool').notifyPrivateMessage({
				action: 'sendPrivate',
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

// ポーティング前から未実装
exports.cancel = function(req, res) {
	res.json({status: 'not implements'});
};

// TODO Messageと一緒
exports.destroy = function(req, res) {
	var body = req.body;
	if (_.isEmpty(body._id)) {
		return res.json(400, {status: 'error', message: "Destroy requires '_id'"});
	}

	req.user.removePrivateMessage(body._id, function(err, msg) {
		if (err) {
			res.json(400, {status: 'error', message: err});
		} else {
			res.json({status: 'ok', number: 1});
			// TODO ここでやりたくない
			require('./websocket_pool').notifyPrivateMessage({
				action: 'removedPrivate',
				info: msg,
				from: msg.created_by,
				from_myself: msg.created_by === req.user.username
			});
		}
	});
};

// TODO Messageと一緒
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
	PrivateMessage.findOne({_id: body.target_id}).exec()
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
			require('./websocket_pool').notifyPrivateResponse({
				action: 'sendResponsePrivate',
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

// TODO Messageと一緒
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
	PrivateMessage.findOne({_id: body.target_id}).exec()
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
