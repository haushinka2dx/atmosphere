/* jshint camelcase: false, quotmark: false */
'use strict';
var User = require('models/user');
var config = require('config');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

// Response: {"status":"ok","count":0,"results":[],"head_user_id":"","tail_user_id":""}
exports.list = function(req, res){
	var query = User.find();
	query.sort({username: 'asc'});
	if (req.query.count) {
		query.limit(req.query.count);
	}
	if (req.query.before_user_id) {
		query.lt('username', req.query.before_user_id);
	}
	if (req.query.after_user_id) {
		query.gt('username', req.query.after_user_id);
	}

	query.exec()
	.onFulfill(function(docs) {
		res.json({
			status: 'ok',
			count: _.size(docs),
			head_user_id: _.isEmpty(docs) ? '' : _.first(docs).username,
			tail_user_id: _.isEmpty(docs) ? '' : _.last(docs).username,
			results: docs
		});
	})
	.onReject(function(err) {
		// TODO
		res.json({status: 'ng'});
	})
	.end();
};

// Response:
//  {"user_id":"bob","introduction":"some introduction",
//   "avator":"images/avator/default_avator.png","groups":[],
//   "relationship":{"listen":[]}}
exports.show = function(req, res){
	var userId = req.query.user_id;
	if (_.isEmpty(userId)) {
		res.json(400, "'user_id' is must be assigned.");
		return;
	}

	User.findByUserId(userId).exec()
	.onFulfill(function(user) {
		if (_.isEmpty(user)) {
			res.json(404, 'user was not found: ' + userId);
			return;
		}
		res.json(user);
	})
	.onReject(function(err) {
		// TODO
		res.json({status: 'ng'});
	})
	.end();
};

// Response: <binary>
exports.avator = function(req, res){
	var userId = req.query.user_id;
	if (_.isEmpty(userId)) {
		res.json(400, "'user_id' is must be assigned.");
		return;
	}

	User.findByUserId(userId).exec()
	.onFulfill(function(user) {
		if (_.isEmpty(user)) {
			res.json(404, 'user was not found: ' + userId);
			return;
		}
		res.sendfile(user.avator);
	})
	.onReject(function(err) {
		// TODO
		res.json({status: 'ng'});
	})
	.end();
};

// Response: {status: 'ok'}
exports.register = function(req, res){
	var userId = req.body.new_user_id;
	var password = req.body.new_user_password;
	if (_.isEmpty(userId) || _.isEmpty(password)) {
		res.json(400, "'new_user_id' and 'new_user_password' are must be assigned.");
		return;
	}

	User.regist(userId, password, req.user.username)
	.onFulfill(function() {
		res.json({status: 'ok'});
	})
	.onReject(function(err) {
		res.json(400, err);
	})
	.end();
};

// Response: {status: 'ok'}
exports.changePassword = function(req, res){
	var currentPass = req.body.current_user_password;
	var newPass = req.body.new_user_password;
	if (_.isEmpty(currentPass) || _.isEmpty(newPass)) {
		res.json(400, "'current_user_password' and 'new_user_password' are must be assigned.");
		return;
	}

	var currentUser = req.user;
	if (!currentUser.authenticate(currentPass)) {
		res.json(400, "There is no user or password does not match.");
		return;
	}

	currentUser.password = newPass;
	currentUser.save(function(err) {
		if (err) {
			res.json(400, err);
		} else {
			res.json({status: 'ok'});
		}
	});
};

// Response: {status: 'ok'}
exports.changeProfile = function(req, res){
	var introduction = req.body.new_introduction;
	if (_.isUndefined(introduction)) {
		res.json(400, "'new_introduction' is must be assigned.");
		return;
	}

	var currentUser = req.user;
	currentUser.introduction = introduction;
	currentUser.save(function(err) {
		if (err) {
			res.json(400, err);
		} else {
			res.json({status: 'ok'});
		}
	});
};


// {"number":1,"status":"ok"}
// TODO test
// TODO 処理はModel側へ委譲すべきか
exports.changeAvator = function(req, res){
	var currentUser = req.user;
	var toDir = config.path.avatorBase + currentUser.username + path.sep;
	var toFilePath = toDir + req.files.profileImage.name;

	// TODO use async
	fs.mkdir(toDir, '0744', function() {
		fs.rename(req.files.profileImage.path, toFilePath, function() {
			currentUser.avator = toFilePath;
			currentUser.save(function(err) {
				if (err) {
					res.json(400, err);
				} else {
					res.json({number: 1, status: "ok"});
				}
			});
		});
	});
};
