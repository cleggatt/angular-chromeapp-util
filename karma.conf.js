module.exports = function(config){

    config.set({
        basePath : '',

        frameworks: [ 'jasmine' ],

        files : [
            // Need to load libraries first
            // TODO Fix ordering issue - use reguirejs
            'test/lib/angular/angular.js',
            'test/lib/angular-mocks/angular-mocks.js',
            'module/js/*.js',
            'test/unit/testHelpers.js',
            'test/unit/**/*Spec.js'
        ],

        reporters: ['dots', 'coverage' ],

        preprocessors: {
            'module/js/*.js': ['coverage']
        },

        coverageReporter: {
            type : 'lcov',
            dir : 'coverage/'
        },

        browsers : ['PhantomJS'],

        captureTimeout: 60000,

        singleRun: true
    })}