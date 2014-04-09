/* jshint camelcase: false, quotmark: false */
'use strict';
var User = require('models/user');
var _ = require('underscore');

exports.status = function(req, res) {
	res.json({status: 'not implements'});
};

// TODO 使われ方が不明
exports.speakers = function(req, res) {
	if (req.query.target_user_id) {
		User.findByUserId(req.query.target_user_id).exec()
		.onFulfill(function(user) {
			if (_.isEmpty(user)) {
				res.json(404, 'user was not found: ' + req.query.target_user_id);
				return;
			}
			res.json(user.getSpeakers());
		})
		.onReject(function(err) {
			// TODO
			res.json({status: 'ng'});
		})
		.end();
		return;
	}
	// TODO レスポンスの詳細が分からん
	res.json(req.user.getSpeakers());
};

// TODO 使われ方が不明
exports.listeners = function(req, res) {
	var userId = req.query.target_user_id;
	if (_.isEmpty(userId)) {
		// TODO 再代入。だが条件演算子だとちょっと長い
		userId = req.user.username;
	}

	User.findByListeners(userId).exec()
	.onFulfill(function(users) {
		// TODO レスポンスの詳細
		res.json(_.map(users, function(user) {
			return user.username;
		}));
	})
	.onReject(function(err) {
		// TODO
		res.json({status: 'ng', error: err});
	})
	.end();
};

exports.listen = function(req, res) {
	// TODO 使われ方が不明
	res.json({status: 'not implements'});
};
