describe('CallbackInfo', function(){
	describe('fire', function(){
		cases([
			[[], true],
			[[1], true],
			[[1, 2], true],
			[[1, 2, 3], true],
			[[1, 2, 3, 4], true],
			[[1, 2, 3, 4, 5], true],
			[[1, 2, 3, 4, 5, 6], true],
			[[1, 2, 3, 4, 5, 6, 7], true],
			[[1, 2, 3, 4, 5, 6, 7, 8], true],
			[[1, 2, 3, 4, 5, 6, 7, 8, 9], true],
			[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], true],
			[[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], false],
		])
		.it('do process when callback exist and args length <= 10', function(args, expectedCalled) {
			var called = false;
			var cbTarget = {name: 'cbTarget name'};
			var callback = function() {
				expect(this).toEqual(cbTarget);
				expect([].slice.apply(arguments)).toEqual(args);
				called = true;
			}
			var subject = new CallbackInfo(callback, cbTarget);
			subject.fire.apply(subject, args);
			expect(called).toEqual(expectedCalled);
		});

		cases([undefined, null])
		.it('do not process when callback not exist', function(callback) {
			// 何もエラーが起きないこと
			new CallbackInfo(callback, {}).fire();
		});
	});
});
