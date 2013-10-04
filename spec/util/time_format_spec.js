describe('getFormatedTime', function(){
	it('渡された日時を<yyyy/mm/dd hh:mm:ss>形式の文字列にする', function(){
		// travisでもテストを通すためにUTCで比較する
		var to_utc = function(y, m, d, h, mm, ss) {
			return new Date(Date.UTC(y, m, d, h, mm, ss));
		}
		expect(getFormatedTime(to_utc(2013, 11, 24, 10, 59, 59))).toEqual('2013/12/24 19:59:59');
		expect(getFormatedTime(to_utc(2013,  1, 24, 10, 59, 59))).toEqual('2013/02/24 19:59:59');
		expect(getFormatedTime(to_utc(2013, 11,  4, 10, 59, 59))).toEqual('2013/12/04 19:59:59');
		expect(getFormatedTime(to_utc(2013, 11, 24,  0, 59, 59))).toEqual('2013/12/24 09:59:59');
		expect(getFormatedTime(to_utc(2013, 11, 24, 10,  9, 59))).toEqual('2013/12/24 19:09:59');
		expect(getFormatedTime(to_utc(2013, 11, 24, 10, 59,  9))).toEqual('2013/12/24 19:59:09');
	});
});

describe('getCurrentTime', function(){
	it('現在時刻をgetFormatedTime()形式の文字列にする', function(){
		expect(getCurrentTime()).toEqual(getFormatedTime(new Date()));
	});
});

describe('padZero', function(){
	it('10未満ならば先頭に0を追加する', function(){
		expect(padZero(0)).toEqual('00');
		expect(padZero(9)).toEqual('09');
	});

	it('10以上ならば何も追加しない', function(){
		expect(padZero(10)).toEqual('10');
		expect(padZero(100)).toEqual('100');
	});
});