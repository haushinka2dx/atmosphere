function CallbackInfo(cb, cbTarget) {
	this.callback = cb;
	this.target = cbTarget;
}
CallbackInfo.prototype.constructor = CallbackInfo;

CallbackInfo.prototype.fire = function() {
	if (atmos.can(this.callback)) {
		var a = arguments;
		switch (a.length) {
			case 0:
				this.callback.call(this.target);
				break;
			case 1:
				this.callback.call(this.target, a[0]);
				break;
			case 2:
				this.callback.call(this.target, a[0], a[1]);
				break;
			case 3:
				this.callback.call(this.target, a[0], a[1], a[2]);
				break;
			case 4:
				this.callback.call(this.target, a[0], a[1], a[2], a[3]);
				break;
			case 5:
				this.callback.call(this.target, a[0], a[1], a[2], a[3], a[4]);
				break;
			case 6:
				this.callback.call(this.target, a[0], a[1], a[2], a[3], a[4], a[5]);
				break;
			case 7:
				this.callback.call(this.target, a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
				break;
			case 8:
				this.callback.call(this.target, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
				break;
			case 9:
				this.callback.call(this.target, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
				break;
			case 10:
				this.callback.call(this.target, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]);
				break;
		}
	}
};
