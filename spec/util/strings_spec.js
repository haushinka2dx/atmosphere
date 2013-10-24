describe('atmosStrings', function(){
	var target;

	beforeEach(function() {
		target = atmosStrings;
	});

	describe('string2array', function(){
		cases([
			['a,b,c,d', ',', ['a','b','c','d']],
			[' a,b , c ,   d     ', ',', ['a','b','c','d']],
			['', ',', []],
			['abc', ',', ['abc']],
			['a:b:c:d', ':', ['a','b','c','d']],
		])
		.it('文字列を指定した区切り文字で区切ってトリムした結果を配列で返す', function(src, sep, expected){
			expect(target.string2array(src, sep)).toEqual(expected);
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
		.it('文字列の中からユーザーIDを抽出する', function(msg, expected) {
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
		.it('文字列の中からグループIDを抽出する', function(msg, expected) {
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
		.it('文字列の中からハッシュタグを抽出する', function(msg, expected) {
			expect(target.extractHashtags(msg)).toEqual(expected);
		});
	});
});
