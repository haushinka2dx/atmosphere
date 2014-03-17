/* jshint camelcase: false, quotmark: false */
'use strict';
var helper = require('../../spec_helper');
require('./db_spec_helper');
var User = require('models/user');
var Group = require('models/group');
var config = require('config');
var expect = require('expect.js');

describe('User', function(){
	var makeRecord = function(name) {
		return new User({
			username: name,
			password: 'test',
			created_by: 'test',
		});
	};

	describe('.regist', function(){
		it('ユーザーを登録できる', function(done) {
			User.regist('bob', 'pass', 'createdBy')
			.then(function(actual) {
				expect(actual.username).to.be('bob');
				expect(actual.avator).to.be(config.assets.defaultAvatorUrl);
				expect(actual.created_by).to.be('createdBy');
				expect(actual.groups).to.have.length(0);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('名前で一意である', function(done) {
			User.regist('bob', 'pass1', 'createdBy')
			.then(function() {
				User.regist('bob', 'pass', 'createdBy')
				.onResolve(function(err) {
					expect(err.code).to.be(11000);
				});
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('パスワードは暗号化して登録される', function(done) {
			User.regist('bob', 'pass', 'createdBy')
			.then(function(actual) {
				expect(actual.password).to.not.be('pass');
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('.create', function(){
		it('パスワードは暗号化して登録される', function(done) {
			var bob = new User({
				username: 'bob',
				password: 'SOME_PASSWORD',
				created_by: 'test',
			});
			User.create(bob)
			.then(function(actual) {
				expect(actual.password).to.not.be('pass');
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('transform', function(){
		it('JSONにすると参照できる情報は制限される', function(done) {
			var bob = new User({
				username: 'bob',
				password: 'SOME_PASSWORD',
				created_by: 'test',
			});
			User.create(bob)
			.then(function(actual) {
				var obj = JSON.parse(JSON.stringify(actual));
				expect(obj.user_id).to.be('bob');
				expect(obj.password).to.be(undefined);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('.registAdmin', function(){
		it('Adminグループに所属している', function(done) {
			User.registAdmin('bob', 'pass', 'createdBy')
			.then(function(actual) {
				expect(actual.groups).to.have.length(2);
				expect(actual.groups[0]).to.be('admin');
				expect(actual.groups[1]).to.be('infra');
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('パスワードは暗号化して登録される', function(done) {
			User.registAdmin('bob', 'pass', 'createdBy')
			.then(function(actual) {
				expect(actual.password).to.not.be('pass');
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('.findByUserId', function(){
		it('指定された名前に一致したユーザーを返す', function(done) {
			var bob = makeRecord('bob');
			var alice = makeRecord('alice');
			User.create([bob, alice])
			.then(function() {
				return User.findByUserId(alice.username).exec();
			})
			.then(function(actual) {
				expect(actual.username).to.be(alice.username);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('ユーザーが存在しなければnullを返す', function(done) {
			var bob = makeRecord('bob');
			User.create(bob)
			.then(function() {
				return User.findByUserId('invalid_user').exec();
			})
			.then(function(actual) {
				expect(actual).to.be(null);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('.findByUserIds', function(){
		it('指定された名前の一覧に含まれる全てのユーザーを返す', function(done) {
			var bob = makeRecord('bob');
			var alice = makeRecord('alice');
			var tom = makeRecord('tom');
			User.create([bob, alice, tom])
			.then(function() {
				return User.findByUserIds([bob.username, tom.username]).exec();
			})
			.then(function(docs) {
				expect(docs).to.have.length(2);
				var names = [docs[0].username, docs[1].username];
				expect(names).to.contain(bob.username);
				expect(names).to.contain(tom.username);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('.findByGroupIds', function(){
		it('指定されたグループに含まれる全てのユーザーを返す', function(done) {
			var group1 = 'group1';
			var group2 = 'group2';
			var group3 = 'group3';
			var bob = makeRecord('bob');
			var alice = makeRecord('alice');
			var tom = makeRecord('tom');
			bob.groups = [group1, group3];
			alice.groups = [group1];
			tom.groups = [group2];

			User.create([bob, alice, tom])
			.then(function() {
				return User.findByGroupIds([group1, group3]).exec();
			})
			.then(function(docs) {
				expect(docs).to.have.length(2);
				var names = [docs[0].username, docs[1].username];
				expect(names).to.contain(bob.username);
				expect(names).to.contain(alice.username);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('#authenticate', function(){
		function expectAuthenticate(comparePass, result, done) {
			var bob = makeRecord('bob');
			var plainPassword = 'my_password';
			bob.password = plainPassword;
			User.create(bob)
			.then(function() {
				return User.findOne({username: bob.username}).exec();
			})
			.then(function(actual) {
				expect(actual.authenticate(comparePass)).to.be(result);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		}

		it('パスワードが正しければtrueを返す', function(done) {
			expectAuthenticate('my_password', true, done);
		});

		it('パスワードが間違っていればfalseを返す', function(done) {
			expectAuthenticate('not_my_password', false, done);
		});
	});

	describe('#password', function(){
		it('パスワードを変更して保存すると自動で暗号化される', function(done) {
			var bob = makeRecord('bob');
			User.create(bob)
			.then(function() {
				return User.findOne({username: bob.username}).exec();
			})
			.then(function(actual) {
				var beforePassword = actual.password;
				actual.password = 'new_pass';
				actual.save(function(err, updateRecord) {
					expect(beforePassword).to.not.be(updateRecord.password);
				});
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('#sendMessage', function(){
		it('メッセージを投稿する', function(done) {
			var bob = makeRecord('bob');
			var message = 'HeyHeyHey';
			User.create(bob)
			.then(function() {
				return User.findOne({username: bob.username}).exec();
			})
			.then(function(user) {
				return user.sendMessage(message);
			})
			.then(function(actual) {
				expect(actual.message).to.be(message);
				expect(actual.created_by).to.be(bob.username);
				expect(actual.message_type).to.be('message');
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('#addGroup', function(){
		var admin;

		beforeEach(function(done) {
			User.registAdmin('admin', 'pass', 'createdBy')
			.then(function(user) {
				admin = user;
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('指定したグループが存在しない場合はエラー', function(done) {
			admin.addGroup('toUser', 'invalidGroup')
			.then(null, function(err) {
				expect(err).to.be("There is no group which id is 'invalidGroup'.");
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('追加対象のユーザーが存在しなければエラー', function(done) {
			Group.registSystem('infra', admin.username)
			.then(function() {
				return admin.addGroup('alice', 'infra');
			})
			.then(null, function(err) {
				expect(err).to.be("Not found user 'alice'.");
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		describe('システムグループ', function(){
			it('権限があればユーザーを追加できる', function(done) {
				Group.registSystem('infra', admin.username)
				.then(function() {
					var alice = makeRecord('alice', 'pass', 'createdBy');
					alice.groups = ['initGroup'];
					return User.create(alice);
				})
				.then(function() {
					return admin.addGroup('alice', 'infra');
				})
				.then(function(updateUser) {
					expect(updateUser.groups).to.have.length(2);
					expect(updateUser.groups[0]).to.be('initGroup');
					expect(updateUser.groups[1]).to.be('infra');
				})
				.onResolve(helper.expectNoError(done))
				.end();
			});

			it('権限がなければユーザーを追加できない', function(done) {
				Group.registSystem('infra', admin.username)
				.then(function() {
					return User.regist('bob', 'pass', 'createdBy');
				})
				.then(function(user) {
					return user.addGroup('toUser', 'infra');
				})
				.then(null, function(err) {
					expect(err).to.be('You have no privilege to manipulate the system group.');
				})
				.onResolve(helper.expectNoError(done))
				.end();
			});
		});

		describe.skip('システムグループ以外', function(){
			it('権限がなくてもユーザーを追加できる', function(done) {
				done();
			});
		});
	});

	describe('#leaveGroup', function(){
		var admin;

		beforeEach(function(done) {
			User.registAdmin('admin', 'pass', 'createdBy')
			.then(function(user) {
				admin = user;
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('指定したグループが存在しない場合はエラー', function(done) {
			admin.leaveGroup('toUser', 'invalidGroup')
			.then(null, function(err) {
				expect(err).to.be("There is no group which id is 'invalidGroup'.");
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('削除対象のユーザーが存在しなければエラー', function(done) {
			Group.registSystem('infra', admin.username)
			.then(function() {
				return admin.leaveGroup('alice', 'infra');
			})
			.then(null, function(err) {
				expect(err).to.be("Not found user 'alice'.");
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		describe('システムグループ', function(){
			it('権限があればユーザーを退会させされる', function(done) {
				Group.registSystem('infra', admin.username)
				.then(function() {
					var alice = makeRecord('alice', 'pass', 'createdBy');
					alice.groups = ['infra', 'initGroup'];
					return User.create(alice);
				})
				.then(function() {
					return admin.leaveGroup('alice', 'infra');
				})
				.then(function(updateUser) {
					expect(updateUser.groups).to.have.length(1);
					expect(updateUser.groups[0]).to.be('initGroup');
				})
				.onResolve(helper.expectNoError(done))
				.end();
			});

			it('権限がなければユーザーを退会させられない', function(done) {
				Group.registSystem('infra', admin.username)
				.then(function() {
					return User.regist('bob', 'pass', 'createdBy');
				})
				.then(function(user) {
					return user.leaveGroup('toUser', 'infra');
				})
				.then(null, function(err) {
					expect(err).to.be('You have no privilege to manipulate the system group.');
				})
				.onResolve(helper.expectNoError(done))
				.end();
			});
		});

		describe.skip('システムグループ以外', function(){
			it('権限がなくてもユーザーを退会させられる', function(done) {
				done();
			});
		});
	});

	describe.skip('#getGroups', function(){
		it('所属グループ取得', function(done) {
			done();
		});
	});

	describe('#hasAdministratorPrivilege', function(){
		it('Adminグループに属していればtrueを返す', function(done) {
			User.registAdmin('bob', 'pass', 'createdBy')
			.then(function(actual) {
				expect(actual.hasAdministratorPrivilege()).to.be(true);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('Adminグループに属していなければfalseを返す', function(done) {
			User.regist('bob', 'pass', 'createdBy')
			.then(function(actual) {
				expect(actual.hasAdministratorPrivilege()).to.be(false);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe.skip('#changeAvator', function(){
		it('アバターを変更', function(done) {
			done();
		});
	});

	describe.skip('#getSpeaker', function(){
		it('指定ユーザーがListenしているユーザーを取得', function(done) {
			done();
		});
	});

	describe.skip('.findByListeners', function(){
		it('指定ユーザーをListenしているユーザーを取得', function(done) {
			done();
		});
	});

	describe.skip('#addSpeaker', function(){
		it('Listenユーザーを追加', function(done) {
			done();
		});
	});

	describe.skip('#removeSpeaker', function(){
		it('Listenユーザーを削除', function(done) {
			done();
		});
	});
});
