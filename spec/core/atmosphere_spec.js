describe('atmos', function(){
	var target;

	beforeEach(function() {
		target = atmos;
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
});
