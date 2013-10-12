var atmosTimeFormat = (function() {
	function AtmosTimeFormat() {
	}

	// return "yyyy/mm/dd hh:mm:ss"
	AtmosTimeFormat.prototype.getFormatedTime = function(date) {
		if (Object.prototype.toString.call(date) === "[object Date]") {
			var year = date.getFullYear();
			var month = paddingTwoDigits(date.getMonth() + 1);
			var day = paddingTwoDigits(date.getDate());
			var hour = paddingTwoDigits(date.getHours());
			var minute = paddingTwoDigits(date.getMinutes());
			var second = paddingTwoDigits(date.getSeconds());
			return year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
		}
		return '';
	}

	//現在時刻取得(yyyy/mm/dd hh:mm:ss)
	AtmosTimeFormat.prototype.getCurrentTime = function() {
		return this.getFormatedTime(new Date());
	}

	// 2桁になるように0埋めする
	function paddingTwoDigits(num) {
		return ("0" + num).slice(-2);
	}

	return new AtmosTimeFormat();
}());
