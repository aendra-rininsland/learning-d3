// Karma configuration
// Generated on Sun Feb 28 2016 17:59:34 GMT+0000 (GMT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // Plugins
    plugins: [
      require('karma-webpack'),
      'karma-mocha',
      'karma-chrome-launcher',
      require('karma-sourcemap-loader'),
      require('karma-nyan-reporter')
    ],

    // list of files / patterns to load in the browser
    files: [
      'test/**/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['nyan'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    webpack: {
      devtool: 'inline-source-map',
      module: {
        preLoaders: [
          {
            test: /\.js$/,
            loader: 'eslint-loader',
            exclude: /node_modules/
          }
        ],
        loaders: [
          {
            test: /\.js?$/, // Another convention is to use the .es6 filetype, but you then
                            // have to supply that explicitly in import statements, which isn't cool.
            exclude: /(node_modules|bower_components)/,
            loader: 'babel'
          },
          // This nifty bit of magic right here allows us to load entire JSON files
          // synchronously using `require`, just like in NodeJS.
          {
            test: /\.json$/,
            loader: 'json-loader'
          },
          // This allows you to `require` CSS files.
          // We be in JavaScript land here, baby! No <style> tags for us!
          {
            test: /\.css$/,
            loader: 'style-loader!css-loader'
          },
          // What's this now? We can use TypeScript inside of Babel-compiled ES6 files? TEH FUUUTUURE 😎
          {
            test: /\.ts$/,
            loader: 'ts-loader'
          }
        ]
      }
    }

  })
}
