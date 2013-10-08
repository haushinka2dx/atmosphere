// TODO 関数定義がグローバル汚染

// return "yyyy/mm/dd hh:mm:ss"
function getFormatedTime(date) {
	return date.getFullYear() + "/" + padZero(date.getMonth() + 1) + "/" + padZero(date.getDate()) + " " + padZero(date.getHours()) + ":" + padZero(date.getMinutes()) + ":"
			+ padZero(date.getSeconds());
}

//現在時刻取得(yyyy/mm/dd hh:mm:ss)
function getCurrentTime() {
	return getFormatedTime(new Date());
}

// 先頭ゼロ付加
function padZero(num) {
	return num < 10 ? "0" + num : "" + num;
}
