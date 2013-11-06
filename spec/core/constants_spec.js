describe('Global Function', function(){
	describe('createRouteMatcherPattern', function(){
		// TODO 引数が空文字/null/undefinedの場合の挙動を修正する
		//      現状の実装では以下のように動くが、これは本来正しい振る舞いではない
		cases([
			['Cat', 'Sub', '/Cat/Sub'],
			['Cat', '', '/Cat/'],
			['', 'Sub', '//Sub'],
			[undefined, 'Sub', '/undefined/Sub'],
			[null, 'Sub', '/null/Sub'],
		])
		.it('category and a subcategory are combined by a slash', function(category, subCategory, expected) {
			var subject = createRouteMatcherPattern(category, subCategory);
			expect(subject).toEqual(expected);
		});
	});
});

describe('ResponseAction', function(){
	var target;

	beforeEach(function() {
		target = getResponseAction();
	});

	describe('all', function(){
		it('returned all response action names', function() {
			expect(target.all()).toEqual(['memo', 'usefull', 'good', 'fun']);
		});
	});

	describe('contains', function(){
		cases([
			['memo', true],
			['usefull', true],
			['good', true],
			['fun', true],
			['quote', false],
		])
		.it('it is true if contained in defined action', function(action, expected) {
			expect(target.contains(action)).toEqual(expected);
		});
	});
});
