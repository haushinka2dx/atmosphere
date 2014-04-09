/* jshint camelcase: false, quotmark: false */
'use strict';
require('./../lib/models/db_spec_helper');
var routes_helper = require('./routes_spec_helper');
var Message = require('models/message');
var expectjs = require('expect.js');
var sinon = require('sinon');
var moment = require('moment');

function isDateStr(value) {
	return !isNaN(Date.parse(value));
}

describe('GET', function() {
	var clock;

	beforeEach(function(done) {
		var baseTime = moment.utc(new Date(2013, 0, 10, 18, 10, 25)).valueOf();
		clock = sinon.useFakeTimers(baseTime);
		var messages = [];
		for (var i=0; i < 3; ++i) {
			messages.push(Message.newNormal('my_normal_msg_' + i, routes_helper.username));
			messages.push(Message.newMonolog('other_normal_msg_' + i, 'other_user'));
			clock.tick(1000); // 1 seconds
		}
		Message.create(messages, done);
	});

	afterEach(function(done) {
		clock.restore();
		done();
	});

	describe('/messages/timeline', function() {
		// TODO users.getSpeakersでcreatedbyをin検索している
		describe('メッセージ取得の条件', function() {
			it('自分が閲覧できる全てのメッセージを返す', function(done) {
				routes_helper.successGet('/messages/timeline')
				.expect(function(res) {
					var body = res.body;
					expectjs(body.status).to.be('ok');
					expectjs(body.count).to.be(3);
					expectjs(isDateStr(body.oldest_created_at)).to.be(true);
					expectjs(isDateStr(body.latest_created_at)).to.be(true);
					expectjs(body.results[0]._id).to.not.be.empty();
					expectjs(body.results[0].message).to.not.be.empty();
					body.results.forEach(function(result) {
						expectjs(result.message).to.match(/my_.*_msg/);
					});
				})
				.end(done);
			});
		});

		describe('オプション指定', function() {
			it('投稿日時の降順で取得できる', function(done) {
				Message.create(Message.newNormal('my_msg', routes_helper.username))
				.onResolve(function() {
					routes_helper.successGet('/messages/timeline')
					.expect(function(res) {
						var body = res.body;
						expectjs(body.status).to.be('ok');
						expectjs(Date.parse(body.oldest_created_at))
						.to.be.lessThan(Date.parse(body.latest_created_at));
					})
					.end(done);
				})
				.end();
			});

			// TODO 可読性悪い
			it('指定した時刻以降に投稿されたメッセージを取得できる', function(done) {
				var dateStr = '2013-01-10T09:10:25.000Z';
				routes_helper.successGet('/messages/timeline?futureThan=' + dateStr)
				.expect(function(res) {
					var body = res.body;
					expectjs(body.status).to.be('ok');
					expectjs(body.count).to.be.greaterThan(0);
					var argDate = Date.parse(dateStr);
					body.results.forEach(function(result) {
						expectjs(Date.parse(result.created_at)).to.be.greaterThan(argDate);
					});
				})
				.end(done);
			});

			it.skip('pastThan', function(done) {
				done();
			});

			it('取得件数を指定できる', function(done) {
				routes_helper.successGet('/messages/timeline?count=2')
				.expect(function(res) {
					var body = res.body;
					expectjs(body.status).to.be('ok');
					expectjs(body.count).to.be(2);
				})
				.end(done);
			});

			it.skip('where', function(done) {
				// TODO クエリストリングの指定が分からん
				/*
					・keywords:
						メッセージ本文に部分一致させたい文字列を指定する。
						カンマ区切りで複数文字列を指定可能であり、その場合は全てORで結合される。
						※ and_or の指定とは無関係
					・hashtags:
						メッセージ中のハッシュタグを完全一致で指定する。
						カンマ区切りで複数指定可能であり、その場合は全てORで結合される。
						※ and_or の指定とは無関係
					・responses:
						memo, fun, good, usefull が指定可能。
						指定されたリアクションが1つでもあるメッセージのみに絞り込む。
						カンマ区切りで複数指定可能であり、その場合は指定したうちのいずれか１つでも
						リアクションがあれば検索にヒットする。
						※ and_or の指定とは無関係
					・created_by:
						メッセージの発信者を完全一致で指定する。
						カンマ区切りで複数指定が可能であり、その場合は指定したユーザーのいずれかが
						発信したメッセージであれば検索にヒットする。
						※ and_or の指定とは無関係
					・address_users:
						メッセージの宛先（ユーザー）を完全一致で指定する。
						カンマ区切りで複数指定が可能であり、その場合は指定したユーザーのいずれかが
						宛先に含まれていれば検索にヒットする。
						※ and_or の指定とは無関係
					・address_groups:
						メッセージの宛先（グループ）を完全一致で指定する。
						カンマ区切りで複数指定が可能であり、その場合は指定したグループのいずれかが
						宛先に含まれていれば検索にヒットする。
						※システムグループかユーザーグループかの指定は出来ない
						※ and_or の指定とは無関係
					・message_types
						メッセージの種別を指定する。具体的には message, announce, monolog が指定可能。
						複数指定した場合は指定したうちのいずれかの種別であれば検索にヒットする。
						※ and_or の指定とは無関係
					*/
				done();
			});

			it.skip('組み合わせ', function(done) {
				done();
			});
		});
	});

	describe.skip('/messages/global_timeline', function() {
		it('timelineと同じ', function(done) {
			done();
		});
	});

	// TODO [ atmos.messages.messageTypeMessage, atmos.messages.messageTypeAnnouncePlus ],
	describe.skip('/messages/talk_timeline', function() {
		// var toMyself = this.persistor.createInCondition('addresses.users', [ currentUserId ]);
		// var fromMyself = this.persistor.createEqualCondition(this.persistor.createdBy, currentUserId);
		// var fromMyselfOrToMyself = this.persistor.joinConditionsOr( [ fromMyself, toMyself ] );
		describe.skip('メッセージ取得の条件', function() {
			it('自分が投稿したメッセージを取得できる', function(done) {
				done();
			});

			it('自分宛に投稿されたメッセージを取得できる', function(done) {
				done();
			});

			it('いずれかの条件に一致するメッセージを取得できる', function(done) {
				done();
			});
		});

		describe.skip('オプション指定', function() {
			it('投稿日時の降順で取得できる', function(done) {
				done();
			});

			it('取得件数を指定できる', function(done) {
				done();
			});

			it.skip('where', function(done) {
				done();
			});

			it.skip('組み合わせ', function(done) {
				done();
			});
		});
	});

	// TODO [ atmos.messages.messageTypeAnnounce, atmos.messages.messageTypeAnnouncePlus ],
	describe.skip('/messages/announce_timeline', function() {
		describe.skip('メッセージ取得の条件', function() {
			it('自分が投稿したメッセージを取得できる', function(done) {
				done();
			});

			it('自分宛に投稿されたメッセージを取得できる', function(done) {
				done();
			});

			it('自分が所属するグループ宛に投稿されたメッセージを取得できる', function(done) {
				done();
			});

			it('いずれかの条件に一致するメッセージを取得できる', function(done) {
				done();
			});
		});

		describe.skip('オプション指定', function() {
			it('投稿日時の降順で取得できる', function(done) {
				done();
			});

			it('取得件数を指定できる', function(done) {
				done();
			});

			it.skip('where', function(done) {
				done();
			});

			it.skip('組み合わせ', function(done) {
				done();
			});
		});
	});

	// TODO [ atmos.messages.messageTypeMonolog ],
	describe.skip('/messages/monolog_timeline', function() {
		describe.skip('メッセージ取得の条件', function() {
			it('自分が投稿したメッセージを取得できる', function(done) {
				done();
			});
		});

		describe.skip('オプション指定', function() {
			it('投稿日時の降順で取得できる', function(done) {
				done();
			});

			it('取得件数を指定できる', function(done) {
				done();
			});

			it.skip('where', function(done) {
				done();
			});

			it.skip('組み合わせ', function(done) {
				done();
			});
		});
	});

	// TODO [ atmos.messages.messageTypeMessage, atmos.messages.messageTypeAnnounce,
	//        atmos.messages.messageTypeAnnouncePlus ],
	// TODO これは何だ？
	describe.skip('/messages/focused_timeline', function() {
		describe.skip('メッセージ取得の条件', function() {
			it('自分が投稿したメッセージを取得できる', function(done) {
				done();
			});
		});

		describe.skip('オプション指定', function() {
			it('投稿日時の降順で取得できる', function(done) {
				done();
			});

			it('取得件数を指定できる', function(done) {
				done();
			});

			it.skip('where', function(done) {
				done();
			});

			it.skip('組み合わせ', function(done) {
				done();
			});
		});
	});

	describe.skip('/messages/search', function() {
		describe.skip('任意の条件で検索できる', function() {
			it('メッセージID指定', function(done) {
				done();
			});
		});

		describe.skip('オプション指定', function() {
			it('投稿日時の降順で取得できる', function(done) {
				done();
			});
		});
	});
});

describe('POST', function() {
	describe('/messages/cancel', function() {
		it('未実装', function(done) {
			routes_helper.successPost('/messages/cancel')
			.expect(function(res) {
				expectjs(res.body.status).to.be('not implements');
			})
			.end(done);
		});
	});

	describe('/messages/send', function() {
		it('メッセージがないとエラー', function(done) {
			routes_helper.expectPost('/messages/send', {}, 400)
			.expect(function(res) {
				expectjs(res.body.message).to.be("'message' are must not be null.");
			})
			.end(done);
		});

		it('メッセージが空文字だとエラー', function(done) {
			var data = {message: ''};
			routes_helper.expectPost('/messages/send', data, 400)
			.expect(function(res) {
				expectjs(res.body.message).to.be("'message' are must not be null.");
			})
			.end(done);
		});

		it('通常のメッセージを投稿できる', function(done) {
			var data = {message: 'Hello'};
			routes_helper.successPost('/messages/send', data)
			.expect(function(res) {
				expectjs(res.body.status).to.be('ok');
				expectjs(res.body._id).to.not.be.empty();
			})
			.end(done);
		});

		it('返信を投稿できる', function(done) {
			var data = {message: 'Thanks', reply_to: 'alice'};
			routes_helper.successPost('/messages/send', data)
			.expect(function(res) {
				expectjs(res.body.status).to.be('ok');
				expectjs(res.body._id).to.not.be.empty();
				// TODO 実際に返信が設定されたかは確認していない
			})
			.end(done);
		});
	});

	describe('/messages/destroy', function() {
		beforeEach(function(done) {
			var messages = [];
			messages.push(Message.newNormal('my_msg', routes_helper.username));
			messages.push(Message.newNormal('other_msg', 'other'));
			Message.create(messages, done);
		});

		it('メッセージIDがないとエラー', function(done) {
			routes_helper.expectPost('/messages/destroy', {}, 400)
			.expect(function(res) {
				expectjs(res.body.status).to.be('error');
				expectjs(res.body.message).to.be("Destroy requires '_id'");
			})
			.end(done);
		});

		it('指定したメッセージが存在しなければエラー', function(done) {
			var data = {_id: '51bb793aca2ab77a3200000d'};
			routes_helper.expectPost('/messages/destroy', data, 400)
			.expect(function(res) {
				expectjs(res.body.status).to.be('error');
				expectjs(res.body.message).to.be("The message to be destroyed was not found.");
			})
			.end(done);
		});

		it('自分が投稿したメッセージでなければエラー', function(done) {
			Message.findOne({message: 'other_msg'}).exec()
			.then(function(message) {
				routes_helper.expectPost('/messages/destroy', {_id: message._id}, 400)
				.expect(function(res) {
					expectjs(res.body.status).to.be('error');
					expectjs(res.body.message)
						.to.be("The message to be destroyed was not your message.");
				})
				.end(done);
			})
			.end();
		});

		it('指定したメッセージを削除できる', function(done) {
			Message.findOne({message: 'my_msg'}).exec()
			.then(function(message) {
				routes_helper.successPost('/messages/destroy', {_id: message._id})
				.expect(function(res) {
					expectjs(res.body.status).to.be('ok');
					expectjs(res.body.number).to.be(1);
				})
				.end(done);
			})
			.end();
		});
	});

	describe.skip('/messages/response', function() {
		it('未実装', function(done) {
			done();
		});
	});

	describe.skip('/messages/remove_response', function() {
		it('未実装', function(done) {
			done();
		});
	});
});
