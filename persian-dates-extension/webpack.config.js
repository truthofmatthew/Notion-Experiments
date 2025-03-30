const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    content: './src/content/content.ts',
    popup: './src/popup/popup.ts',
    background: './src/background/background.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: true,
        mangle: true,
        format: {
          comments: false,
        },
      },
      extractComments: false,
    })]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/popup/popup.html", to: "popup.html" },
        { from: "src/popup/popup.css", to: "popup.css" },
        { from: "manifest.json", to: "manifest.json" },
        {
          from: "assets",
          to: "assets",
          globOptions: { ignore: ["**/*.DS_Store"] }
        }
      ]
    })
  ]
};
