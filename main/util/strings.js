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

	AtmosStrings.prototype.endsWith = function(src, stringForSearch) {
		if (typeof(src) === 'undefined' || typeof(stringForSearch) === 'undefined' || src.length === 0 || stringForSearch.length === 0 || src.length < stringForSearch.length) {
			return false;
		}
		return src.substring(src.length - stringForSearch.length, src.length) === stringForSearch;
	};

	AtmosStrings.prototype.getExtension = function(filename) {
		if (filename.lastIndexOf('.') > -1) {
			return filename.substring(filename.lastIndexOf('.') + 1, filename.length);
		}
		else {
			return '';
		}
	};

	return new AtmosStrings();
}());
