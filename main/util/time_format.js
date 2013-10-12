var atmosTimeFormat = (function() {
	function AtmosTimeFormat() {
	}

	// return "yyyy/mm/dd hh:mm:ss"
	AtmosTimeFormat.prototype.getFormatedTime = function(date) {
		if (Object.prototype.toString.call(date) === "[object Date]") {
			var year = date.getFullYear();
			var month = padZero(date.getMonth() + 1);
			var day = padZero(date.getDate());
			var hour = padZero(date.getHours());
			var minute = padZero(date.getMinutes());
			var second = padZero(date.getSeconds());
			return year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
		}
		return '';
	}

	//現在時刻取得(yyyy/mm/dd hh:mm:ss)
	AtmosTimeFormat.prototype.getCurrentTime = function() {
		return this.getFormatedTime(new Date());
	}

	// 先頭ゼロ付加
	function padZero(num) {
		return ("0" + num).slice(-2);
	}

	return new AtmosTimeFormat();
}());
