var atmosTimeFormat = (function() {
	function AtmosTimeFormat() {
	}

	// return "yyyy/mm/dd hh:mm:ss"
	AtmosTimeFormat.prototype.getFormattedTime = function(date) {
		if (Object.prototype.toString.call(date) === "[object Date]") {
			return date.getFullYear()
						+ '/' + paddingTwoDigits(date.getMonth() + 1)
						+ '/' + paddingTwoDigits(date.getDate())
						+ ' ' + paddingTwoDigits(date.getHours())
						+ ':' + paddingTwoDigits(date.getMinutes())
						+ ':' + paddingTwoDigits(date.getSeconds());
		}
		return '';
	}

	//現在時刻取得(yyyy/mm/dd hh:mm:ss)
	AtmosTimeFormat.prototype.getCurrentTime = function() {
		return this.getFormattedTime(new Date());
	}

	// 2桁になるように0埋めする
	function paddingTwoDigits(num) {
		return ("0" + num).slice(-2);
	}

	return new AtmosTimeFormat();
}());
