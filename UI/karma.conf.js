module.exports = function (config) {
  config.set({
    preset: 'jasmarin',
    clearContext: false,
    autoWatch: true,
    singleRun: false,
    browsers: ['Chrome'],
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    client: {
      captureConsole: false,
      clearContext: false
    },
    files: [
      { pattern: 'node_modules/core-js/**/*.js', watched: false },
      { pattern: 'node_modules/zone.js/**/*.js', watched: false },
      { pattern: 'node_modules/zone.js/testing/**/*.js', watched: false },
      { pattern: 'src/test.ts', watched: false }
    ],
    preprocessors: {
      'src/test.ts': ['webpack']
    },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: {
        extensions: ['.ts', '.js']
      },
      module: {
        rules: [
          { test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/ }
        ]
      },
      stats: {
        modules: false,
        color: false
      }
    },
    webpackMiddleware: {
      stats: 'errors-only'
    }
  });
};