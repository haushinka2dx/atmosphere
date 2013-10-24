var atmosStrings = (function() {
	function AtmosStrings() {
	}

	AtmosStrings.prototype.string2array = function(src, sep) {
		if (typeof(src) === 'undefined' || src == null || src.length === 0) {
			return [];
		}
		else {
			return src.split(sep).map(function(s) { return s.trim(); });
		}
	}

	AtmosStrings.prototype.extractAddressesUsers = function(msg) {
		var addressList = new Array();
		var pattern = /[^@\-_a-zA-Z0-9]@([a-zA-Z0-9\-_]+)/g;
		var tempMsg = ' ' + msg + ' ';
		var address;
		while (address = pattern.exec(tempMsg)) {
			addressList.push(address[1]);
		}
		return addressList;
	};
	
	AtmosStrings.prototype.extractAddressesGroups = function(msg) {
		var addressList = new Array();
		var pattern = /[^$\-_a-zA-Z0-9]\$([a-zA-Z0-9\-_]+)/g;
		var tempMsg = ' ' + msg + ' ';
		var address;
		while (address = pattern.exec(tempMsg)) {
			addressList.push(address[1]);
		}
		return addressList;
	};
	
	AtmosStrings.prototype.extractHashtags = function(msg) {
		var hashtagList = new Array();
		var pattern = /[^#]#([^#@ \n]+)/g;
		var tempMsg = ' ' + msg + ' ';
		var address;
		while (hashtag = pattern.exec(tempMsg)) {
			hashtagList.push(hashtag[1]);
		}
		return hashtagList;
	};

	return new AtmosStrings();
}());
