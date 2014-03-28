/* jshint camelcase: false */
'use strict';
var mongoose = require('mongoose');
var User = require('models/user');
var _ = require('underscore');

var typeSystem = 'system';
var typeUser = 'user';

var GroupSchema = new mongoose.Schema({
	group_id: { type: String, required: true, unique: true },
	group_type: { type: String, required: true, enum: [typeSystem, typeUser] },
	group_name: { type: String, default: '' },
	group_explanation: { type: String, default: '' },
});

GroupSchema.plugin(require('./plugins/base_schema'));

GroupSchema.statics.adminIds = ['admin', 'infra'];

GroupSchema.pre('save', function(next, done) {
	if (this.group_type !== typeSystem) {
		next();
		return;
	}

	var createdBy = this.created_by;
	mongoose.model('User').findByUserId(createdBy).exec()
	.then(function(user) {
		if (_.isEmpty(user)) {
			done(new Error('Not Found user <' + createdBy + '>'));
		}
		if (!user.hasAdministratorPrivilege()) {
			done(new Error('<' + createdBy + '> have no privilege to manipulate system group.'));
		} else {
			next();
		}
	})
	.end();
});

// TODO test / callback
GroupSchema.statics.registSystem = function(id, createdBy) {
	var M = mongoose.model('Group');
	return this.create(M.newSystemGroup(id, createdBy));
};

// TODO test / callback
GroupSchema.statics.newRecord = function(id, type, createdBy) {
	var M = mongoose.model('Group');
	if (type === typeSystem) {
		return M.newSystemGroup(id, createdBy);
	} else if (type === typeUser) {
		return M.newUserGroup(id, createdBy);
	}
	// TODO error
};

GroupSchema.statics.newSystemGroup = function(id, createdBy) {
	return new this({
		group_id: id,
		group_type: typeSystem,
		created_by: createdBy,
	});
};

GroupSchema.statics.newUserGroup = function(id, createdBy) {
	return new this({
		group_id: id,
		group_type: typeUser,
		created_by: createdBy,
	});
};

GroupSchema.statics.findByGroupId = function(groupId, callback) {
	return this.findOne({group_id: groupId}, callback);
};

GroupSchema.statics.findByGroupIds = function(groupIds, callback) {
	var sort = {sort: {username: 1 }};
	return this.find({group_id: {$in: groupIds}}, null, sort, callback);
};

// TODO userIdを引数でもらうのは微妙。こいつは権限気にせずただメンバーを返すだけの方が
GroupSchema.methods.getMembers = function(execUser) {
	if (this.group_type === typeSystem) {
		if (!execUser.hasAdministratorPrivilege()) {
			throw 'You has no privilege to manipulate the target group.';
		}
	} else if (this.created_by !== execUser.username) {
			throw 'or the target group is not your group.';
	}

	return mongoose.model('User').find().where('groups').in(this.group_id);
};

// TODO userIdを引数でもらうのは微妙。こいつは権限気にせずただ削除だけの方が
// TODO 他がremoveなのにここだけdestroyは微妙
GroupSchema.methods.destroy = function(execUser, callback) {
	if (this.group_type === typeSystem) {
		if (!execUser.hasAdministratorPrivilege()) {
			throw 'You has no privilege to manipulate the target group.';
		}
	} else if (this.created_by !== execUser.username) {
			throw 'or the target group is not your group.';
	}

	return this.remove(callback);
};

module.exports = mongoose.model('Group', GroupSchema);
