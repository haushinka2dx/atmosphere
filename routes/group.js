/* jshint camelcase: false, quotmark: false */
'use strict';
var Group = require('models/group');
var _ = require('underscore');

// Response: {"status":"ok","count":0,"results":[],"head_group_id":"","tail_group_id":""}
exports.list = function(req, res){
	var query = Group.find();
	query.sort({username: 'asc'});
	if(req.query.count) {
		query.limit(req.query.count);
	}
	if(req.query.before_group_id) {
		query.lt('group_id', req.query.before_group_id);
	}
	if(req.query.after_group_id) {
		query.gt('group_id', req.query.after_group_id);
	}

	query.exec()
	.onFulfill(function(docs) {
		res.json({
			status: 'ok',
			count: _.size(docs),
			head_group_id: _.isEmpty(docs) ? '' : _.first(docs).group_id,
			tail_group_id: _.isEmpty(docs) ? '' : _.last(docs).group_id,
			results: docs
		});
	})
	.onReject(function(err) {
		// TODO
		res.json({status: 'ng'});
	})
	.end();
};

// Response: {number: 1, status: 'ok'}
exports.addMember = function(req, res){
	var groupId = req.body.group_id;
	var addUserId = req.body.user_id;
	if(_.isEmpty(groupId) || _.isEmpty(addUserId)) {
		res.json(400, "'group_id' and 'user_id' are must be assigned.");
		return;
	}

	var fromUserId = req.user.username;
	req.user.addGroup(addUserId, groupId)
	.onFulfill(function() {
		res.json({number: 1, status: 'ok'});
	})
	.onFulfill(function() {
		Group
			.findByGroupId(groupId)
			.exec(function(err, group) {
				// TODO ここでやりたくない
				require('./websocket_pool').notifyAddGroupMember(addUserId, group, fromUserId);
			});
	})
	.onReject(function(err) {
		// TODO
		res.json({status: 'ng'});
	})
	.end();
};

// Response: {number: 1, status: 'ok'}
exports.removeMember = function(req, res){
	var groupId = req.body.group_id;
	var addUserId = req.body.user_id;
	if(_.isEmpty(groupId) || _.isEmpty(addUserId)) {
		res.json(400, "'group_id' and 'user_id' are must be assigned.");
		return;
	}

	var fromUserId = req.user.username;
	req.user.leaveGroup(addUserId, groupId)
	.onFulfill(function() {
		res.json({number: 1, status: 'ok'});
	})
	.onFulfill(function() {
		Group
			.findByGroupId(groupId)
			.exec(function(err, group) {
				// TODO ここでやりたくない
				require('./websocket_pool').notifyRemoveGroupMember(addUserId, group, fromUserId);
			});
	})
	.onReject(function(err) {
		// TODO
		res.json({status: 'ng'});
	})
	.end();
};

// {_id: "5abb75f3-ac50-4ad2-a6b2-896ed2ee218a", status: "ok"}
exports.register = function(req, res){
	var groupId = req.body.new_group_id;
	var groupType = req.body.new_group_type;
	if(_.isEmpty(groupId) || _.isEmpty(groupType)) {
		res.json(400, "'new_group_id' and 'new_group_type' are must be assigned.");
		return;
	}
	// TODO 簡易チェック。ただし0とかも空扱いになるので厳密には正しくない
	var groupName = req.body.new_group_name || '';
	var groupExplanation = req.body.new_group_explanation || '';

	req.user.createGroup(groupId, groupType, groupName, groupExplanation)
	.onFulfill(function(group) {
		if (_.isEmpty(group)) {
			// TODO
			res.json({status: 'ng'});
			return;
		}
		res.json({status: 'ok'});
	})
	.onReject(function(err) {
		// TODO
		res.json({status: 'ng'});
	})
	.end();
};

// Response: ?
exports.destroy = function(req, res){
	var groupId = req.body.group_id;
	if(_.isEmpty(groupId)) {
		res.json(400, "'group_id' is must be assigned.");
		return;
	}

	Group.findOne({group_id: groupId}).exec()
	.onFulfill(function(group) {
		if (_.isEmpty(group)) {
			// TODO
			res.json({status: 'ng'});
			return;
		}
		group.destroy(req.user, function(err) {
			if (err) {
				// TODO
				res.json({status: 'ng'});
				return;
			}
			res.json({number: 1, status: 'ok'});
		});
	})
	.onReject(function(err) {
		// TODO
		res.json({status: 'ng'});
	})
	.end();
};
