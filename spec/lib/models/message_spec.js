/* jshint camelcase: false */
'use strict';
var helper = require('../../spec_helper');
require('./db_spec_helper');
var Message = require('models/message');
var expect = require('expect.js');
var cases = require('cases');
var sinon = require('sinon');
var moment = require('moment');

describe('Message', function(){
	describe('new instance', function(){
		var text = 'Hey!';
		var createdBy = 'alice';

		function expectInstance(message, expectType, done) {
			expect(message.message).to.be(text);
			expect(message.message_type).to.be(expectType);
			expect(message.created_by).to.be(createdBy);
			Message.create(message)
			.onResolve(helper.expectNoError(done))
			.end();
		}

		describe('.newNormal', function(){
			it('通常メッセージのインスタンスを作成する', function(done) {
				expectInstance(Message.newNormal(text, createdBy), 'message', done);
			});
		});

		describe('.newAnnounce', function(){
			it('Announceメッセージのインスタンスを作成する', function(done) {
				expectInstance(Message.newAnnounce(text, createdBy), 'announce', done);
			});
		});

		describe('.newAnnouncePlus', function(){
			it('AnnouncePlusメッセージのインスタンスを作成する', function(done) {
				expectInstance(Message.newAnnouncePlus(text, createdBy), 'announce_plus', done);
			});
		});

		describe('.newMonolog', function(){
			it('Monologメッセージのインスタンスを作成する', function(done) {
				expectInstance(Message.newMonolog(text, createdBy), 'monolog', done);
			});
		});
	});

	// TODO message側が[bob, tom]って感じでクオートなしでなぜか入っていて
	//      arrayで比較できないので要素ごとに検証している
	describe('extract the information', function(){
		it('メッセージからユーザー名を抽出する', cases([
				['', []],
				['aaa3329', []],
				['hello @edwards', ['edwards']],
				['@john are you online?', ['john']],
				['I will take a lunch with @jack, @joe, and @bob.', ['jack','joe','bob']],
			], function(text, expected) {
			var message = Message.newNormal(text, 'alice');
			expect(message.message).to.be(text);
			expected.forEach(function(v, i) {
				expect(message.addresses.users[i]).to.be(v);
			});
		}));

		it('メッセージからグループ名を抽出する', cases([
				['', []],
				['aaa3329', []],
				['hello $libro team.', ['libro']],
				['$infra it is a day to finish.', ['infra']],
				['There are $teama, $teamb, and $teamc.', ['teama','teamb','teamc']],
			], function(text, expected) {
			var message = Message.newNormal(text, 'alice');
			expect(message.message).to.be(text);
			expected.forEach(function(v, i) {
				expect(message.addresses.groups[i]).to.be(v);
			});
		}));

		it('メッセージからハッシュタグを抽出する', cases([
				['', []],
				['aaa3329', []],
				['this is problem #at', ['at']],
				['#fyi apache 2.2 is faster than apache 2.4.', ['fyi']],
				['This is first version. #app #version #release', ['app','version','release']],
			], function(text, expected) {
			var message = Message.newNormal(text, 'alice');
			expect(message.message).to.be(text);
			expected.forEach(function(v, i) {
				expect(message.hashtags[i]).to.be(v);
			});
		}));
	});

	describe('#created_at', function(){
		var clock;

		beforeEach(function(done) {
			var baseTime = moment.utc(new Date(2013, 0, 10, 18, 10, 25)).valueOf();
			clock = sinon.useFakeTimers(baseTime);
			done();
		});

		afterEach(function(done) {
			clock.restore();
			done();
		});

		it('規定フォーマットの文字列であること', function(done) {
			var result = /2013-01-10T09:10:25.\d{3}Z$/;
			var message = Message.newNormal('hey', 'alice');
			expect(message.created_at).to.be.match(result);
			Message.create(message)
			.then(function(doc) {
				expect(doc.created_at).to.be.match(result);
			})
			.onResolve(helper.expectNoError(done))
			.end();
		});
	});
});


//    getMessages(callbackInfo, currentUserId, messagesTypes, condition, additionalConditionJSON, futureThan, pastThan, count)
//    getMessagesDirectly(callbackInfo, messagesTypes, condition, additionalConditionJSON, futureThan, pastThan, count)

// TODO 必要になったら
// Event
//    createNotifyEventInfo(callbackInfo, action, targetMsg, includeFromUser, alternativeFromUserId)
//    createSentMessageEventInfo(callbackInfo, msgSent)
//    createSentResponseEventInfo(callbackInfo, targetMsg, responderUserId)
//    createRemovedMessageEventInfo(callbackInfo, msgRemoved)

// 削除
//    destroy(callbackInfo, id, currentUserId)

// Response
//    addResponse(callbackInfo, targetMessageId, respondedBy, responseAction)
//    removeResponse(callbackInfo, targetMessageId, respondedBy, responseAction)
//    changeResponse(callbackInfo, targetMessageId, respondedBy, responseAction, operation)
//    createBlankResponseInfo()

