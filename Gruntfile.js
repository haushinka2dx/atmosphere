'use strict';

module.exports = function(grunt) {
	grunt.initConfig({
		jshint: {
			files: [
				'lib/**/*.js',
				'routes/**/*.js',
				'spec/**/*.js',
				'Gruntfile.js',
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		simplemocha: {
			options: {
				ui: 'bdd',
				reporter: 'spec'
			},

			all: {
				src: ['spec/**/*_spec.js']
			}
		},
		// TODO 毎回alltestだときつい
		esteWatch: {
			options: {
				dirs: ['./', 'routes/**/', 'lib/**/', 'spec/**/'],
				livereload: {
					enabled: false
				}
			},
			'*': function() {
				//return ['jshint', 'simplemocha'];
				return ['simplemocha'];
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-este-watch');

	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('test', ['simplemocha']);
	// TODO coverage(./coverage.sh) -> スクリプトの実行方法さえ分かれば
	// TODO nodemon -> スクリプトの実行方法さえ分かれば
	grunt.registerTask('all-test', ['jshint', 'simplemocha']);
	grunt.registerTask('watch-test', ['esteWatch']);
};
