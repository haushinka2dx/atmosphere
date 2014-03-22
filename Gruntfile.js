/* jshint maxlen:false */
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

		mochacov: {
			options: {
				ui: 'bdd',
				reporter: 'spec',
			},
			all: ['spec/**/*_spec.js']
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
				//return ['jshint', 'mochacov'];
				return ['mochacov'];
			}
		},

		nodemon: {
			dev: {
				script: 'app.js'
			},
			options: {
				env: {
					NODE_PATH: 'lib:',
				}
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-este-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-mocha-cov');

	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('test', ['mochacov']);

	grunt.registerTask('all-test', ['jshint', 'mochacov']);
	grunt.registerTask('watch-test', ['esteWatch']);
};
