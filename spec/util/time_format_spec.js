describe('atmosTimeFormat', function(){
	var target;

	beforeEach(function() {
		target = atmosTimeFormat;
	});

	describe('getFormattedTime', function(){
		it('渡された日時を<yyyy/mm/dd hh:mm:ss>形式の文字列にする', function(){
			expect(target.getFormattedTime(new Date(2013, 11, 24, 23, 59, 59))).toEqual('2013/12/24 23:59:59');
			expect(target.getFormattedTime(new Date(2013,  1, 24, 23, 59, 59))).toEqual('2013/02/24 23:59:59');
			expect(target.getFormattedTime(new Date(2013, 11,  4, 23, 59, 59))).toEqual('2013/12/04 23:59:59');
			expect(target.getFormattedTime(new Date(2013, 11, 24,  3, 59, 59))).toEqual('2013/12/24 03:59:59');
			expect(target.getFormattedTime(new Date(2013, 11, 24, 23,  9, 59))).toEqual('2013/12/24 23:09:59');
			expect(target.getFormattedTime(new Date(2013, 11, 24, 23, 59,  9))).toEqual('2013/12/24 23:59:09');
		});

		it('日付以外が渡された場合は空文字を返す', function(){
			expect(target.getFormattedTime(null)).toEqual('');
			expect(target.getFormattedTime(undefined)).toEqual('');
			expect(target.getFormattedTime('')).toEqual('');
			expect(target.getFormattedTime({})).toEqual('');
		});
	});

	describe('getCurrentTime', function(){
		it('現在時刻をgetFormattedTime()形式の文字列にする', function(){
			expect(target.getCurrentTime()).toEqual(target.getFormattedTime(new Date()));
		});
	});
});
