/* jshint camelcase: false, unused:false */
'use strict';
var _ = require('underscore');
var User = require('models/user');

var pool = {};

exports.regist = function(userId, conn) {
	// TODO check exists? -> 常に上書き?
	pool[userId] = conn;
};

exports.get = function(userId) {
	return pool[userId];
};

// TODO すべての通知でnotify(というかdelay)を使うようにする
var notify = function(username, data) {
	if (username in pool) {
		var delay = username === data.from ? 0 : 5000;
		console.log(username, '--------', delay);
		setTimeout(function() {
			pool[username].write(JSON.stringify(data));
		}, delay);
	}
};

function writer(data) {
	return function(conn, username) {
		notify(username, data);
	};
}

// TODO 常に自分は通知を受けるっぽい

// TODO 本来はここが持つべき処理ではない
// TODO 複雑度が高い
exports.notifyMessage = function(data) {
	var type = data.info.message_type;
	if (type === 'message') {
		// 全てのユーザー
		_.map(pool, writer(data));
	} else if (type === 'announce') {
		// メッセージに含まれるグループのメンバー
		User
			.findByGroupIds(data.info.addresses.groups)
			.exec(function(err, users) {
				if (err) {
					// TODO error処理
					return;
				}
				_.each(users, function(user) {
					if (user.username in pool) {
						pool[user.username].write(JSON.stringify(data));
					}
				});
			});
	} else if (type === 'announce_plus') {
		// メッセージに含まれるメンバーと、指定された宛先のユーザー
		var selectors = [
			User.findByUserIds(data.info.addresses.users),
			User.findByGroupIds(data.info.addresses.groups)
			];
		_.each(selectors, function(promise) {
			promise.exec(function(err, users) {
				if (err) {
					// TODO error処理
					return;
				}
				_.each(users, function(user) {
					if (user.username in pool) {
						pool[user.username].write(JSON.stringify(data));
					}
				});
			});
		});
	} else if (type === 'monolog') {
		// 自分だけ
		_.chain(pool)
			.select(function(conn, username) {
				return username === data.info.created_by;
			})
			.map(writer(data));
	}
};

// TODO notifyMessageと共通化
//      actionとannounce/announce_plusのとこだけ違う
exports.notifyResponse = function(data, action) {
	var type = data.info.message_type;
	if (type === 'message') {
		// 全てのユーザー
		_.map(pool, writer(data));
	} else if (type === 'announce') {
		// メッセージに含まれるグループのメンバー
		User
			.findByGroupIds(data.info.addresses.groups)
			.exec(function(err, users) {
				if (err) {
					// TODO error処理
					return;
				}

				// TODO infoの上書き(not 再代入)だけを行うようにする。
				var response = JSON.stringify({
					action: data.action,
					info: {
						target_msg_id : data.info._id,
						action : action
					},
					from: data.from,
					from_myself: data.from_myself
				});
				_.each(users, function(user) {
					if (user.username in pool) {
						pool[user.username].write(response);
					}
				});
				if (data.from in pool) {
					pool[data.from].write(response);
				}
			});
	} else if (type === 'announce_plus') {
		// メッセージに含まれるメンバーと、指定された宛先のユーザー
		var selectors = [
			User.findByUserIds(data.info.addresses.users),
			User.findByGroupIds(data.info.addresses.groups)
			];
		_.each(selectors, function(promise) {
			promise.exec(function(err, users) {
				if (err) {
					// TODO error処理
					return;
				}

				var response = JSON.stringify({
					action: data.action,
					info: {
						target_msg_id : data.info._id,
						action : action
					},
					from: data.from,
					from_myself: data.from_myself
				});
				_.each(users, function(user) {
					if (user.username in pool) {
						pool[user.username].write(response);
					}
				});
				if (data.from in pool) {
					pool[data.from].write(response);
				}
			});
		});
	} else if (type === 'monolog') {
		// 自分だけ
		_.chain(pool)
			.select(function(conn, username) {
				return username === data.info.created_by;
			})
			.map(writer(data));
	}
};

// TODO 本来はここが持つべき処理ではない
exports.notifyPrivateMessage = function(data) {
	var response = JSON.stringify(data);
	// どの操作でもmsgのto_user_idで絞り込み
	_.each(data.info.to_user_id, function(username) {
		if (username in pool) {
			pool[username].write(response);
		}
	});
	if (data.from in pool) {
		pool[data.from].write(response);
	}
};

// TODO message版と共通化
exports.notifyPrivateResponse = function(data, action) {
	var response = JSON.stringify({
		action: data.action,
		info: {
			target_msg_id : data.info._id,
			action : action
		},
		from: data.from,
		from_myself: data.from_myself
	});
	_.each(data.info.to_user_id, function(username) {
		if (username in pool) {
			pool[username].write(response);
		}
	});
	if (data.from in pool) {
		pool[data.from].write(response);
	}
	if (data.info.created_by in pool) {
		pool[data.info.created_by].write(response);
	}
};

var notifyChangeGroupMember = function(action, toUsername, group, fromUsername) {
	var response = JSON.stringify({
		action: action,
		info: {
			group_id : group.group_id,
			target_user_id : toUsername,
		},
		from: fromUsername,
		from_myself: toUsername === fromUsername
	});

		// グループメンバーを追加
		User
			.findByGroupIds([group.group_id])
			.exec(function(err, users) {
				if (err) {
					// TODO error処理
					return;
				}
				_.each(users, function(user) {
					if (user.username in pool) {
						pool[user.username].write(response);
					}
				});
				// 追加したユーザーに通知
				if (toUsername in pool) {
					pool[toUsername].write(response);
				}
				// ユーザーグループの場合はグループオーナーを必ず追加
				if (group.group_type === 'user') {
					if (group.created_by in pool) {
						pool[group.created_by].write(response);
					}
				}
			});
};

// TODO test
exports.notifyAddGroupMember = function(toUsername, group, fromUsername) {
	notifyChangeGroupMember('addGroupMember', toUsername, group, fromUsername);
};

// TODO test
exports.notifyRemoveGroupMember = function(toUsername, group, fromUsername) {
	notifyChangeGroupMember('removeGroupMember', toUsername, group, fromUsername);
};

