var vertx = require('vertx');
var container = require('vertx/container');
// jasmine.Terminalreporter内で`console`を使うのでrequire必須
var console = require('vertx/console');

try {
	// loading test libraries
	load('spec/lib/jasmine-1.3.1/atmos_jasmine.js');
	load('spec/lib/jasmine-1.3.1/jasmine.terminal_reporter.js');
	load('spec/lib/jasmine-parameterize/jasmine-parameterize.js');

	// TODO 自動でspec配下を見て、mainと/spec両方loadするようにしたい
	// include source files here...
	load('main/util/general.js');
	load('main/util/time_format.js');
	load('main/util/strings.js');
	load('main/core/atmosphere.js');
	load('main/core/callback_info.js');
	load('main/core/constants.js');
	load('main/event/event_info.js');

	// include spec files here...
	load('spec/util/general_spec.js');
	load('spec/util/time_format_spec.js');
	load('spec/util/strings_spec.js');
	load('spec/core/atmosphere_spec.js');
	load('spec/core/callback_info_spec.js');
	load('spec/core/constants_spec.js');
	load('spec/event/event_info_spec.js');

	jasmine.getEnv().addReporter(new jasmine.TerminalReporter({verbosity: 2, color: true}));
	jasmine.getEnv().execute();
} catch(e) {
	console.log(e);
} finally {
	container.exit();
}
