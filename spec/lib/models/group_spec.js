/* jshint camelcase: false */
'use strict';
var helper = require('../../spec_helper');
require('./db_spec_helper');
var Group = require('models/group');
var User = require('models/user');
var expect = require('expect.js');

describe('Group', function(){
	var makeRecord = function(name) {
		return new Group({
			group_id: name,
			group_type: 'user',
			created_by: 'test',
		});
	};

	var makeSystemRecord = function(name, createdBy) {
		return new Group({
			group_id: name,
			group_type: 'system',
			created_by: createdBy,
		});
	};

	describe('.create', function(){
		it('システムグループは権限があれば登録できる', function(done) {
			User.registAdmin('admin', 'pass', 'createdBy')
			.then(function(user) {
				return Group.create(makeSystemRecord('group1', 'admin'));
			})
			.then(function(group) {
				expect(group.group_id).to.be('group1');
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('システムグループは権限がなければ登録できない', function(done) {
			User.regist('normal', 'pass', 'createdBy')
			.then(function() {
				return Group.create(makeSystemRecord('group1', 'normal'));
			})
			.onFulfill(function() {
				expect().fail();
			})
			.onReject(function(err) {
				// TODO exepectに失敗するとtimeoutとして出力されてしまう
				expect(err.message).to.be('<normal> have no privilege to manipulate system group.');
				done();
			})
			.end();
		});

		it('システムグループ以外は権限がなくても登録できる', function(done) {
			User.regist('normal', 'pass', 'createdBy')
			.then(function() {
				return Group.create(makeRecord('group1', 'normal'));
			})
			.then(function(group) {
				expect(group.group_id).to.be('group1');
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});

		it('グループIDで一意である', function(done) {
			Group.create(makeRecord('group1'))
			.then(function() {
				Group.create(makeRecord('group1'))
				.onResolve(function(err) {
					expect(err.code).to.be(11000);
				});
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('.newSystemGroup', function(){
		it('システムグループのインスタンスを作成する', function(done) {
			var group = Group.newSystemGroup('infra', 'createdBy');
			expect(group.group_id).to.be('infra');
			expect(group.group_type).to.be('system');
			expect(group.created_by).to.be('createdBy');
			done();
		});
	});

	describe('.newUserGroup', function(){
		it('ユーザーグループのインスタンスを作成する', function(done) {
			var group = Group.newUserGroup('friend', 'admin');
			expect(group.group_id).to.be('friend');
			expect(group.group_type).to.be('user');
			expect(group.created_by).to.be('admin');
			done();
		});
	});

	describe('.findByGroupId', function(){
		it('指定されたグループIDに一致したグループを返す', function(done) {
			var g1 = makeRecord('group1');
			var g2 = makeRecord('group2');
			Group.create([g1, g2])
			.then(function() {
				return Group.findByGroupId(g1.group_id).exec();
			})
			.then(function(actual) {
				expect(actual.group_id).to.be(g1.group_id);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('.findByGroupIds', function(){
		it('指定されたグループIDの一覧に含まれる全てのグループを返す', function(done) {
			var g1 = makeRecord('group1');
			var g2 = makeRecord('group2');
			var g3 = makeRecord('group3');
			Group.create([g1, g2, g3])
			.then(function() {
				return Group.findByGroupIds([g1.group_id, g3.group_id]).exec();
			})
			.then(function(docs) {
				expect(docs).to.have.length(2);
				var ids = [docs[0].group_id, docs[1].group_id];
				expect(ids).to.contain(g1.group_id);
				expect(ids).to.contain(g3.group_id);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe.skip('.destroy', function(){
		describe('システムグループ', function(){
			it('権限があれば削除できる', function(done) {
				done();
			});

			// You has no privilege to manipulate the target group, or the target group is not your group.
			it('権限がなければ削除できない', function(done) {
				done();
			});
		});

		describe('システムグループ以外', function(){
			it('作成者であれば削除できる', function(done) {
				done();
			});

			// You has no privilege to manipulate the target group, or the target group is not your group.
			it('作成者でなければ削除できない', function(done) {
				done();
			});
			// TODO 作成者じゃなくても管理者なら操作できるのでは？
		});
	});

	describe.skip('#getMembers', function(){
		describe('システムグループ', function(){
			it('権限があればメンバー一覧を取得できる', function(done) {
				done();
			});

			// You has no privilege to manipulate the target group, or the target group is not your group.
			it('権限がなければ取得できない', function(done) {
				done();
			});
		});

		describe('システムグループ以外', function(){
			it('作成者であれば取得できる', function(done) {
				done();
			});

			// You has no privilege to manipulate the target group, or the target group is not your group.
			it('作成者でなければ取得できない', function(done) {
				done();
			});
			// TODO 作成者じゃなくても管理者なら操作できるのでは？
		});
	});
});
