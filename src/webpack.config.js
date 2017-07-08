var nodeExternals = require('webpack-node-externals')

module.exports = {
   entry: './main.js',
   target: 'node',
   externals: [nodeExternals()],
   output: {
      libraryTarget: 'commonjs',
      path: '.webpack',
      filename: 'main.js', // this should match the first part of function handler in serverless.yml
   },
   module: {
      loaders: [
         {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loaders: ["babel-loader"]
         },
         {
            test: /\.json?$/,
            exclude: /node_modules/,
            loaders: ["json-loader"]
         }
      ]
   }
};
