var vertx = require('vertx');
var container = require('vertx/container');
// jasmine.Terminalreporter内で`console`を使うのでrequire必須
var console = require('vertx/console');

(function() {
	// loading test libraries
	load('spec/lib/jasmine-1.3.1/atmos_jasmine.js');
	load('spec/lib/jasmine-1.3.1/jasmine.terminal_reporter.js');
	load('spec/lib/jasmine-parameterize/jasmine-parameterize.js');

	var spec_ready = false;
	function load_specs(base) {
		// except lib and spec_runner.js
		vertx.fileSystem.readDir(base, '(?!lib)(?!spec_runner.js).*', function(err, files) {
			if (err) {
				console.log('Oops! read directoy error');
				console.log(err);
				container.exit();
			}

			files.forEach(function(absolute_path) {
				vertx.fileSystem.props(absolute_path, function(err, props) {
					if (err) {
						console.log('Oops! file props error');
						console.log(err);
						container.exit();
					}

					if (props.isDirectory) {
						load_specs(absolute_path);
					} else {
						// NOTE:
						//  絶対パスでload出来ないため相対パスに変換している
						//  'spec/'が最初に見つかった位置からの相対パスになるため、
						//  ワークスペースより上階層に'spec/'という名前があると正しく動かない
						var relative_path = absolute_path.substr(absolute_path.indexOf('spec/'));
						load(relative_path.replace('spec/', 'main/').replace('_spec', ''));
						load(relative_path);
					}
				});
			});
			spec_ready = true;
		});
	}

	load_specs('spec');

	// Since vert.x fileSystem is asynchronous.
	vertx.setTimer(1000, function(timerId) {
		if (spec_ready) {
			jasmine.getEnv().addReporter(new jasmine.TerminalReporter({verbosity: 2, color: true}));
			jasmine.getEnv().execute();
			container.exit();
		}
	});
})();
