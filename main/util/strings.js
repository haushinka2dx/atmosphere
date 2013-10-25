var atmosStrings = (function() {
	function AtmosStrings() {
	}

	AtmosStrings.prototype.string2array = function(src, sep) {
		if (atmosGeneral.canl(src)) {
			return src.split(sep).map(function(s) { return s.trim(); });
		}
		else {
			return [];
		}
	}

	AtmosStrings.prototype.extractAddressesUsers = function(msg) {
		return extract(msg, /[^@\-_a-zA-Z0-9]@([a-zA-Z0-9\-_]+)/g);
	};
	
	AtmosStrings.prototype.extractAddressesGroups = function(msg) {
		return extract(msg, /[^$\-_a-zA-Z0-9]\$([a-zA-Z0-9\-_]+)/g);
	};
	
	AtmosStrings.prototype.extractHashtags = function(msg) {
		return extract(msg, /[^#]#([^#@ \n]+)/g);
	};

	function extract(msg, regexPattern) {
		var results = [];
		var tempMsg = ' ' + msg + ' ';
		var matched;
		while (matched = regexPattern.exec(tempMsg)) {
			results.push(matched[1]);
		}
		return results;
	};

	return new AtmosStrings();
}());
