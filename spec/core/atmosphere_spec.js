describe('atmos', function(){
	var target;
	var global;

	beforeEach(function() {
		target = atmos;
		global = new Function("return this")();
	});

	describe('log', function(){
		it('output', function() {
			var msg = 'hoge';
			spyOn(global, 'plog');
			target.log(msg);
			
			// NOTE:loggerまで見ようとするとエラーになるので、msgだけ確認する
			// InternalError: Java class "org.vertx.java.core.logging.Logger" has no public instance field
			// or method named "__Jasmine_been_here_before__". (spec/lib/jasmine-1.3.1/atmos_jasmine.js#1913)
			// in spec/lib/jasmine-1.3.1/atmos_jasmine.js (line 1913)
			expect(plog.calls[0].args[1]).toEqual(msg);
		});
	});
	
	describe('varDump', function(){
		cases([
			[], [null], [undefined], [''], [[]], [{}],
			['hoge'], [[1, 2]], [{key: 'value'}],
		])
		.it('it changes into json and is outputted to a log', function(value) {
			spyOn(global, 'plog');
			target.varDump(value);
			// NOTE:loggerを見ないのは上記と同様の理由から
			expect(plog.calls[0].args[1]).toEqual(JSON.stringify(value));
		});
	});
	
	describe('dumpRequest', function(){
		it('output', function() {
			var req = {};
			spyOn(global, 'dump_request');
			target.dumpRequest(req);
			// NOTE:loggerを見ないのは上記と同様の理由から
			expect(dump_request.calls[0].args[1]).toEqual(req);
		});
	});
	
	describe('can', function(){
		cases([
			[undefined, false],
			[null, false],
			[0, true],
			[[], true],
			['', true],
		])
		.it('judge a target is valid or not', function(v, expected) {
			expect(target.can(v)).toEqual(expected);
		});
	});
	
	describe('canl', function(){
		cases([
			[undefined, false],
			[null, false],
			[1, false],
			['', false],
			[[], false],
			[{}, false],
			[' ', true],
			[['a','e'], true],
			[function() { return 1; }, true],
		])
		.it('judge a target is object has length more than 0 or function', function(v, expected){
			expect(target.canl(v)).toEqual(expected);
		});
	});

	describe('referenceDateTime', function(){
		it('date delayed in regular time is returned', function(){
			var now = 1383388311305;
			spyOn(Date, 'now').andReturn(now);
			// NOTE: 期待値の書き方が実装に依存しすぎているかもしれない
			var expected = new Date(now - (Atmosphere.prototype.constants.publishDelaySeconds * 1000))
			expect(target.referenceDateTime()).toEqual(expected);
			expect(Date.now.calls.length).toEqual(1);
		});
	});

	describe('parseUTC', function(){
		it('convert date-string to date-object in UTC', function(){
			var expected = new Date(Date.UTC(2010, 5, 9, 15, 20, 1))
			expect(target.parseUTC('2010-06-09T15:20:01.000Z')).toEqual(expected);
		});
	});

	describe('uniqueArray', function(){
		cases([
			[undefined, []],
			[null, []],
			[[], []],
			[[1, 2], [1, 2]],
			[[1, 2, 2, 3], [1, 2, 3]],
			[['a', 'b', 'c', 'c'], ['a', 'b', 'c']],
			[[{a: 1}, {b: 2}, {b: 2}], [{a: 1}, {b: 2}, {b: 2}]],
		])
		.it('the element of an array is made unique', function(arg, expected){
			expect(target.uniqueArray(arg)).toEqual(expected);
		});
	});

	describe('string2array', function(){
		it('string is divided by a specified delimiter', function(){
			var str = 'a-b';
			var sep = '-';
			var expected = ['a', 'b'];
			spyOn(atmosStrings, 'string2array').andReturn(expected);
			expect(target.string2array(str, sep)).toEqual(expected);
			expect(atmosStrings.string2array).toHaveBeenCalledWith(str, sep);
		});

		it('string is divided by a default delimiter', function(){
			var str = 'a,b';
			var expected = ['a', 'b'];
			spyOn(atmosStrings, 'string2array').andReturn(expected);
			expect(target.string2array(str)).toEqual(expected);
			expect(atmosStrings.string2array).toHaveBeenCalledWith(str, ',');
		});
	});

	describe('string2array', function(){
		it('string is divided by a specified delimiter', function(){
			var str = 'a-b';
			var sep = '-';
			var expected = ['a', 'b'];
			spyOn(atmosStrings, 'string2array').andReturn(expected);
			expect(target.string2array(str, sep)).toEqual(expected);
			expect(atmosStrings.string2array).toHaveBeenCalledWith(str, sep);
		});

		it('string is divided by a default delimiter', function(){
			var str = 'a,b';
			var expected = ['a', 'b'];
			spyOn(atmosStrings, 'string2array').andReturn(expected);
			expect(target.string2array(str)).toEqual(expected);
			expect(atmosStrings.string2array).toHaveBeenCalledWith(str, ',');
		});
	});

	describe('extractAddressesUsers', function(){
		cases([
			  ['', []],
			  ['aaa3329', []],
			  ['hello @edwards', ['edwards']],
			  ['@john are you online?', ['john']],
			  ['I will take a lunch with @jack, @joe, and @bob.', ['jack','joe','bob']],
		])
		.it('userId is extracted out of string', function(msg, expected) {
			expect(target.extractAddressesUsers(msg)).toEqual(expected);
		});
	});

	describe('extractAddressesGroups', function(){
		cases([
			  ['', []],
			  ['aaa3329', []],
			  ['hello $libro team.', ['libro']],
			  ['$infra it is a day to finish.', ['infra']],
			  ['There are $teama, $teamb, and $teamc.', ['teama','teamb','teamc']],
		])
		.it('groupId is extracted out of string', function(msg, expected) {
			expect(target.extractAddressesGroups(msg)).toEqual(expected);
		});
	});

	describe('extractHashtags', function(){
		cases([
			  ['', []],
			  ['aaa3329', []],
			  ['this is problem #at', ['at']],
			  ['#fyi apache 2.2 is faster than apache 2.4.', ['fyi']],
			  ['This is first version. #app #version #release', ['app','version','release']],
		])
		.it('hashtags is extracted out of string', function(msg, expected) {
			expect(target.extractHashtags(msg)).toEqual(expected);
		});
	});

	describe('createTemporaryFilePath', function(){
		cases(['txt', 'png'])
		.it('by a specified extension', function(extension) {
			var expected = atmos.constants.temporaryPath + '.*\.' + extension + '$';
			expect(target.createTemporaryFilePath(extension)).toMatch(expected);
		});

		// TODO 空文字でもデフォルト拡張子を使うべきな気がする
		cases([undefined, null])
		.it('by a default extension', function(extension) {
			var expected = atmos.constants.temporaryPath + '.*\.tmp$';
			expect(target.createTemporaryFilePath(extension)).toMatch(expected);
		});
	});
});
