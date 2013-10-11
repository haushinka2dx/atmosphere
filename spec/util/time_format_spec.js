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
