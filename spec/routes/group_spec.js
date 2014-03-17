/* jshint camelcase: false, quotmark: false */
'use strict';
require('./../lib/models/db_spec_helper');
var routes_helper = require('./routes_spec_helper');
var Group = require('models/group');
var expectjs = require('expect.js');

// TODO テストデータとはいえDB構造に依存しているなあ...
var makeRecord = function(name) {
	return new Group({
		group_id: name,
		group_type: 'user',
		created_by: 'test_user_0',
	});
};

describe('GET /group/list', function(){
	beforeEach(function(done) {
		var groups = [];
		for (var i=0; i < 10; i++) {
			groups.push(makeRecord('test_group_' + i));
		}
		Group.create(groups, done);
	});

	it('条件指定がなければ全グループの一覧を返す', function(done){
		routes_helper.successGet('/group/list')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(10);
			expectjs(body.head_group_id).to.be('test_group_0');
			expectjs(body.tail_group_id).to.be('test_group_9');
			for (var i=0; i < 10; i++) {
				expectjs(body.results[i].group_id).to.be('test_group_' + i);
			}
		})
		.end(done);
	});

	it('取得件数を指定できる', function(done){
		routes_helper.successGet('/group/list?count=5')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(5);
			expectjs(body.head_group_id).to.be('test_group_0');
			expectjs(body.tail_group_id).to.be('test_group_4');
			for (var i=0; i < 5; i++) {
				expectjs(body.results[i].group_id).to.be('test_group_' + i);
			}
		})
		.end(done);
	});

	it('指定したグループより前の一覧を取得できる', function(done){
		routes_helper.successGet('/group/list?before_group_id=test_group_3')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(3);
			expectjs(body.head_group_id).to.be('test_group_0');
			expectjs(body.tail_group_id).to.be('test_group_2');
			for (var i=0; i < 3; i++) {
				expectjs(body.results[i].group_id).to.be('test_group_' + i);
			}
		})
		.end(done);
	});

	it('指定したグループより後の一覧を取得できる', function(done){
		routes_helper.successGet('/group/list?after_group_id=test_group_7')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(2);
			expectjs(body.head_group_id).to.be('test_group_8');
			expectjs(body.tail_group_id).to.be('test_group_9');
			expectjs(body.results[0].group_id).to.be('test_group_8');
			expectjs(body.results[1].group_id).to.be('test_group_9');
		})
		.end(done);
	});

	it('存在しないグループ名を指定した場合は空を返す(before_group_id)', function(done){
		routes_helper.successGet('/group/list?before_group_id=a')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(0);
			expectjs(body.head_group_id).to.be('');
			expectjs(body.tail_group_id).to.be('');
			expectjs(body.results).to.be.empty();
		})
		.end(done);
	});

	it('存在しないグループ名を指定した場合は空を返す(after_group_id)', function(done){
		routes_helper.successGet('/group/list?after_group_id=z')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(0);
			expectjs(body.head_group_id).to.be('');
			expectjs(body.tail_group_id).to.be('');
			expectjs(body.results).to.be.empty();
		})
		.end(done);
	});

	it('条件を組み合わせることができる', function(done){
		routes_helper.successGet('/group/list?after_group_id=test_group_6&count=2')
		.expect(function(res) {
			var body = res.body;
			expectjs(body.status).to.be('ok');
			expectjs(body.count).to.be(2);
			expectjs(body.head_group_id).to.be('test_group_7');
			expectjs(body.tail_group_id).to.be('test_group_8');
			expectjs(body.results[0].group_id).to.be('test_group_7');
			expectjs(body.results[1].group_id).to.be('test_group_8');
		})
		.end(done);
	});

	it.skip('エラー時', function(done){
		done();
	});

	it.skip('where指定(paramNameSearchCondition)', function(done){
		done();
	});
});

describe('POST /group/add_member', function(){
	beforeEach(function(done) {
		var groups = [];
		groups.push(makeRecord('test_group_0'));
		groups.push(makeRecord('test_group_1'));
		Group.create(groups, done);
	});

	it('グループ名がなければ400を返す(キーなし)', function(done){
		var data = {user_id: 'bob'};
		routes_helper.expectPost('/group/add_member', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'group_id' and 'user_id' are must be assigned.");
		})
		.end(done);
	});

	it('グループ名がなければ400を返す(値が空)', function(done){
		var data = {group_id: '', user_id: 'bob'};
		routes_helper.expectPost('/group/add_member', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'group_id' and 'user_id' are must be assigned.");
		})
		.end(done);
	});

	it('追加ユーザー名がなければ400を返す(キーなし)', function(done){
		var data = {group_id: 'friend'};
		routes_helper.expectPost('/group/add_member', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'group_id' and 'user_id' are must be assigned.");
		})
		.end(done);
	});

	it('追加ユーザー名がなければ400を返す(値が空)', function(done){
		var data = {group_id: 'friend', user_id: ''};
		routes_helper.expectPost('/group/add_member', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'group_id' and 'user_id' are must be assigned.");
		})
		.end(done);
	});

	// TODO 権限があればとか？
	it.skip('グループにユーザーを追加できる', function(done){
		done();
	});
});

describe('POST /group/remove_member', function(){
	beforeEach(function(done) {
		var groups = [];
		groups.push(makeRecord('test_group_0'));
		groups.push(makeRecord('test_group_1'));
		Group.create(groups, done);
	});

	it('グループ名がなければ400を返す(キーなし)', function(done){
		var data = {user_id: 'bob'};
		routes_helper.expectPost('/group/remove_member', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'group_id' and 'user_id' are must be assigned.");
		})
		.end(done);
	});

	it('グループ名がなければ400を返す(値が空)', function(done){
		var data = {group_id: '', user_id: 'bob'};
		routes_helper.expectPost('/group/remove_member', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'group_id' and 'user_id' are must be assigned.");
		})
		.end(done);
	});

	it('削除ユーザー名がなければ400を返す(キーなし)', function(done){
		var data = {group_id: 'friend'};
		routes_helper.expectPost('/group/remove_member', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'group_id' and 'user_id' are must be assigned.");
		})
		.end(done);
	});

	it('削除ユーザー名がなければ400を返す(値が空)', function(done){
		var data = {group_id: 'friend', user_id: ''};
		routes_helper.expectPost('/group/remove_member', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'group_id' and 'user_id' are must be assigned.");
		})
		.end(done);
	});

	// TODO 権限があればとか？
	it.skip('グループからユーザーを削除できる', function(done){
		done();
	});
});

describe('POST /group/register', function(){
	it('グループ名がなければ400を返す(キーなし)', function(done){
		var data = {new_group_type: 'system'};
		routes_helper.expectPost('/group/register', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'new_group_id' and 'new_group_type' are must be assigned.");
		})
		.end(done);
	});

	it('グループ名がなければ400を返す(値が空)', function(done){
		var data = {new_group_id: '', new_group_type: 'system'};
		routes_helper.expectPost('/group/register', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'new_group_id' and 'new_group_type' are must be assigned.");
		})
		.end(done);
	});

	it('グループ種別がなければ400を返す(キーなし)', function(done){
		var data = {new_group_id: 'new-group'};
		routes_helper.expectPost('/group/register', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'new_group_id' and 'new_group_type' are must be assigned.");
		})
		.end(done);
	});

	it('グループ種別がなければ400を返す(値が空)', function(done){
		var data = {new_group_id: 'new-group', new_group_type: ''};
		routes_helper.expectPost('/group/register', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'new_group_id' and 'new_group_type' are must be assigned.");
		})
		.end(done);
	});

	// TODO 権限があればとか？
	it.skip('グループからユーザーを削除できる', function(done){
		done();
	});
});

describe('POST /group/destroy', function(){
	beforeEach(function(done) {
		var groups = [];
		groups.push(makeRecord('test_group_0'));
		groups.push(makeRecord('test_group_1'));
		Group.create(groups, done);
	});

	it('グループ名がなければ400を返す(キーなし)', function(done){
		var data = {};
		routes_helper.expectPost('/group/destroy', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'group_id' is must be assigned.");
		})
		.end(done);
	});

	it('グループ名がなければ400を返す(値が空)', function(done){
		var data = {group_id: ''};
		routes_helper.expectPost('/group/destroy', data, 400)
		.expect(function(res) {
			expectjs(res.body).to.be("'group_id' is must be assigned.");
		})
		.end(done);
	});

	// TODO 権限があればとか？
	it.skip('グループを削除できる', function(done){
		done();
	});
});
