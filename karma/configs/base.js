"use strict";
module.exports = function (config) {
    config.set({

        // Base path that will be used to resolve all patterns (eg. files, exclude).
        basePath: "../..",

        // Frameworks to use.
        // Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ["karma-typescript", "fixture", "jasmine"],

        // List of files to load in the browser.
        files: [
            "karma/**/*.html",
            "karma/**/*.ts",
            "src/**/*.ts"
        ],

        // Exclude files from karma loading (after TS compilation)
        exclude: [
            "src/dev/compare/index.ts"
        ],

        // Preprocess matching files before serving them to the browser.
        // Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            "**/*.ts": ["karma-typescript"],
            "**/*.html": ["html2js"],
        },

        karmaTypescriptConfig: {
            tsconfig: "tsconfig.json",

            // Exclude files from TS compilation
            exclude: [],

            compilerOptions: {
                "sourceMap": true,
            },

            // Exclude all files from coverage
            // NOTE: When we want to run coverage, we need a way to exclude BLOB files created by compression workers
            // Otherwise Karma can't map those blobs to an actual file and it causes an error '__cov_..... is undefined'
            coverageOptions: {
                exclude: [/^.*$/]
            }
        },

        // Start these browsers.
        // Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [],

        // Test results reporter to use.
        // Possible values: 'dots', 'progress'.
        // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ["progress"],

        // Disallow Karma launching multiple browsers at the same time
        concurrency: 1
    });
};
