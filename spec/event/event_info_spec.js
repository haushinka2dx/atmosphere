describe('EventAction', function(){
	describe('contains', function(){
		cases([
			[EventAction.prototype.sendMessage, true],
			['not found', false],
		])
		.it('it is true if contained in the event list', function(name, expected) {
			expect(new EventAction().contains(name)).toEqual(expected);
		});
	});
});

describe('EventInfo', function(){
	describe('toJSON', function(){
		it('json string is return', function() {
			expect(new EventInfo('fooAction', 'fooInfo', 'fooFrom').toJSON())
				.toEqual('{"action":"fooAction","info":"fooInfo","from":"fooFrom"}');
		});
	});
});
