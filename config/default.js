module.exports = {
	admin: {
		id: 'admin',
		password: 'password',
	},

	log: {
		config: 'config/log/development.json'
	},

	db: {
		url: 'mongodb://localhost:27017/atmosphere_dev'
	},

	api: {
		host: 'localhost',
		port: 9999
	},

	notify: {
		host: 'localhost',
		port: 9998
	},

	session: {
		timeout: 10 * 60 * 1000,
		connection: 10
	},

	path: {
		temporary : 'tmp/',
		avatorBase : 'uploaded/avator/',
		attachmentsImageBase : 'uploaded/images/',
		attachmentsEtcBase : 'uploaded/etc/',
	},

	assets: {
		defaultAvatorUrl: 'assets/avator/default_avator.png',
	},

	message: {
		publishDelaySeconds: 5
	}
};
