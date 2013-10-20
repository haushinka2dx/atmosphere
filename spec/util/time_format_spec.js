describe('atmosTimeFormat', function(){
	var target;

	beforeEach(function() {
		target = atmosTimeFormat;
	});

	describe('getFormattedTime', function(){
		cases([
			[new Date(2013, 11, 24, 23, 59, 59), '2013/12/24 23:59:59'],
			[new Date(2013,  1, 24, 23, 59, 59), '2013/02/24 23:59:59'],
			[new Date(2013, 11,  4, 23, 59, 59), '2013/12/04 23:59:59'],
			[new Date(2013, 11, 24,  3, 59, 59), '2013/12/24 03:59:59'],
			[new Date(2013, 11, 24, 23,  9, 59), '2013/12/24 23:09:59'],
			[new Date(2013, 11, 24, 23, 59,  9), '2013/12/24 23:59:09'],
		])
		.it('渡された日時を<yyyy/mm/dd hh:mm:ss>形式の文字列にする', function(date, expected){
			expect(target.getFormattedTime(date)).toEqual(expected);
		});

		cases([undefined, null, '', 0, [], {}, function(){}])
		.it('日付以外が渡された場合は空文字を返す', function(arg){
			expect(target.getFormattedTime(arg)).toEqual('');
		});
	});

	describe('getCurrentTime', function(){
		it('現在時刻をgetFormattedTime()形式の文字列にする', function(){
			expect(target.getCurrentTime()).toEqual(target.getFormattedTime(new Date()));
		});
	});
});
