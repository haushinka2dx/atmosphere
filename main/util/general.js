var atmosGeneral = (function() {
	function AtmosGeneral() {
	}

	AtmosGeneral.prototype.can = function(v) {
		return typeof(v) != 'undefined' && v != null;
	};

	AtmosGeneral.prototype.canl = function(v) {
		return AtmosGeneral.prototype.can(v) && (typeof(v) === 'function' || v.length > 0);
	};

	return new AtmosGeneral();
}());
