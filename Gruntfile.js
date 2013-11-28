module.exports = function(grunt) {

    grunt.initConfig({
        bower: {
            install: {
                options: {
                    // Since this is just a module we only need the dependencies for testing
                    targetDir: './test/lib'
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        coveralls: {
            options: {
                coverage_dir: 'coverage'
            }
        }
    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-karma-coveralls');

    grunt.registerTask('travis', ['bower', 'karma', 'coveralls']);
    grunt.registerTask('default', ['bower', 'karma']);
};