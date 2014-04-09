/* jshint camelcase: false */
'use strict';
var helper = require('../../spec_helper');
require('./db_spec_helper');
var PrivateMessage = require('models/private');
var expect = require('expect.js');
var cases = require('cases');

describe('PrivateMessage', function(){
	describe('new instance', function(){
		it('通常メッセージのインスタンスを作成する', function(done) {
			var text = 'Hey!';
			var toUserIds = ['id1'];
			var createdBy = 'alice';
			var message = PrivateMessage.newMessage(toUserIds, text, createdBy);
			expect(message.message).to.be(text);
			expect(message.created_by).to.be(createdBy);
			PrivateMessage.create(message)
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});

	describe('extract the information', function(){
		it('メッセージからハッシュタグを抽出する', cases([
				['', []],
				['aaa3329', []],
				['this is problem #at', ['at']],
				['#fyi apache 2.2 is faster than apache 2.4.', ['fyi']],
				['This is first version. #app #version #release', ['app','version','release']],
			], function(text, expected) {
			var message = PrivateMessage.newMessage([], text, 'alice');
			expect(message.message).to.be(text);
			expected.forEach(function(v, i) {
				expect(message.hashtags[i]).to.be(v);
			});
		}));
	});
});
